/**
 * Dice Panel Interactions
 */

import type { ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, TextBasedChannel } from "discord.js";
import { isSendableChannel } from "../utils";
import {
  buildCustomDiceModal,
  buildDiceComponents,
  addDie,
  undoLastDie,
  clearDiceState,
  rollAccumulatedDice,
  formatAccumulatedDice,
  parseAndRoll,
  getDicePanel,
  setGameSystem,
  type DiceType,
  type GameSystem,
} from "../panels";

/**
 * Append roll result to history message
 */
async function appendToHistory(
  channel: TextBasedChannel,
  channelId: string,
  discordUserId: string,
  resultText: string,
  interaction: ButtonInteraction | ModalSubmitInteraction
): Promise<boolean> {
  const dicePanel = getDicePanel(channelId);
  if (!dicePanel || !("messages" in channel)) return false;

  try {
    const historyMsg = await channel.messages.fetch(dicePanel.historyMessageId);
    const currentContent = historyMsg.content;
    const newEntry = `<@${discordUserId}> ${resultText}`;

    if (currentContent.length + newEntry.length + 2 > 1900) {
      await interaction.reply({
        content: "歷史訊息已滿，請使用 `/panel dice` 重新建立面板",
        ephemeral: true
      });
      return true; // Handled, but as error
    }

    const newContent = currentContent === "**擲骰歷史**\n—"
      ? `**擲骰歷史**\n${newEntry}`
      : `${currentContent}\n${newEntry}`;

    await historyMsg.edit(newContent);
    return true;
  } catch {
    return false;
  }
}

/**
 * Handle dice button interactions
 */
export async function handleDiceButton(
  interaction: ButtonInteraction,
  discordUserId: string,
  parts: string[]
): Promise<void> {
  const action = parts[1];
  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) return;

  switch (action) {
    case "quick": {
      // dice:quick:expression:guildId
      const expression = parts[2];
      const result = parseAndRoll(expression);
      if (!result) {
        await interaction.reply({ content: "無效的骰子表達式", ephemeral: true });
        return;
      }

      const handled = await appendToHistory(channel, interaction.channelId, discordUserId, result.text, interaction);
      if (handled) {
        if (!interaction.replied) {
          await interaction.reply({ content: `你的結果: ${result.text}`, ephemeral: true });
        }
        return;
      }
      await interaction.reply(`<@${discordUserId}> ${result.text}`);
      return;
    }

    case "custom": {
      // dice:custom:guildId
      const guildId = parts[2];
      const modal = buildCustomDiceModal(guildId);
      await interaction.showModal(modal);
      return;
    }

    case "add": {
      // dice:add:diceType:guildId
      const diceType = parts[2] as DiceType;
      const guildId = parts[3];
      const state = addDie(discordUserId, diceType, guildId);
      const accumulated = formatAccumulatedDice(state);
      await interaction.reply({ content: `你的累積: ${accumulated}`, ephemeral: true });
      return;
    }

    case "roll": {
      // dice:roll:guildId
      const rollResult = rollAccumulatedDice(discordUserId);
      if (!rollResult) {
        await interaction.reply({ content: "沒有累積的骰子", ephemeral: true });
        return;
      }

      const historyText = rollResult.replace(/\n\n\*\*Total:.*\*\*$/, "").replace(/\n/g, " | ");
      const handled = await appendToHistory(channel, interaction.channelId, discordUserId, historyText, interaction);
      if (handled) {
        if (!interaction.replied) {
          await interaction.reply({ content: `你的結果:\n${rollResult}`, ephemeral: true });
        }
        return;
      }
      await interaction.reply(`<@${discordUserId}> 擲骰:\n${rollResult}`);
      return;
    }

    case "clear": {
      clearDiceState(discordUserId);
      await interaction.reply({ content: "已清除累積", ephemeral: true });
      return;
    }

    case "undo": {
      const state = undoLastDie(discordUserId);
      if (!state) {
        await interaction.reply({ content: "沒有可撤銷的骰子", ephemeral: true });
        return;
      }
      const accumulated = formatAccumulatedDice(state);
      await interaction.reply({ content: `你的累積: ${accumulated}`, ephemeral: true });
      return;
    }

    default:
      await interaction.reply({ content: "Unknown action", ephemeral: true });
      return;
  }
}

/**
 * Handle dice modal submit
 */
export async function handleDiceModalSubmit(
  interaction: ModalSubmitInteraction,
  discordUserId: string
): Promise<void> {
  const expression = interaction.fields.getTextInputValue("dice_expression");
  const result = parseAndRoll(expression);

  if (!result) {
    await interaction.reply({ content: "無效的骰子表達式", ephemeral: true });
    return;
  }

  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) {
    await interaction.reply({ content: result.text, ephemeral: true });
    return;
  }

  const channelId = interaction.channelId;
  if (channelId) {
    const dicePanel = getDicePanel(channelId);
    if (dicePanel && "messages" in channel) {
      try {
        const historyMsg = await channel.messages.fetch(dicePanel.historyMessageId);
        const currentContent = historyMsg.content;
        const newEntry = `<@${discordUserId}> ${result.text}`;

        if (currentContent.length + newEntry.length + 2 > 1900) {
          await interaction.reply({
            content: "歷史訊息已滿，請使用 `/panel dice` 重新建立面板",
            ephemeral: true
          });
          return;
        }

        const newContent = currentContent === "**擲骰歷史**\n—"
          ? `**擲骰歷史**\n${newEntry}`
          : `${currentContent}\n${newEntry}`;

        await historyMsg.edit(newContent);
        await interaction.reply({
          content: `你的結果: ${result.text}\n複製: \`${expression}\``,
          ephemeral: true
        });
        return;
      } catch {
        // Fall through
      }
    }
  }

  await interaction.reply(`<@${discordUserId}> ${result.text}`);
}

/**
 * Handle dice select menu (game system selection)
 */
export async function handleDiceSelectMenu(
  interaction: StringSelectMenuInteraction,
  discordUserId: string,
  parts: string[]
): Promise<void> {
  const guildId = parts[2];
  const selectedSystem = interaction.values[0] as GameSystem;
  const channelId = interaction.channelId;

  // Update the game system
  setGameSystem(channelId, selectedSystem);

  // Update the panel with new components
  const components = buildDiceComponents(guildId, channelId);
  await interaction.update({ components });
}
