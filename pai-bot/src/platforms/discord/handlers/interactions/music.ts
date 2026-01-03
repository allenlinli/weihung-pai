/**
 * Music Panel Interactions
 */

import type { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import {
  skip,
  stop as stopVoice,
  leaveChannel,
  getGuildControlPanels,
  clearControlPanel,
  previous,
  playAt,
  setControlPanel,
} from "../../voice";
import { isSendableChannel } from "../utils";
import {
  buildPanelContent,
  buildPanelComponents,
  buildDiceComponents,
  setGameSystem,
  getDicePanel,
  type PanelMode,
  type GameSystem,
} from "../panels";

/**
 * Handle panel mode switch - delete old message and send new one
 */
export async function handlePanelSwitch(
  interaction: ButtonInteraction,
  discordUserId: string,
  mode: PanelMode,
  guildId: string
): Promise<void> {
  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) return;

  // Delete old message
  try {
    await interaction.message.delete();
  } catch {
    // Ignore delete errors
  }

  // Send new message at bottom
  const content = buildPanelContent(mode, guildId);
  const components = buildPanelComponents(mode, guildId);
  const newMessage = await channel.send({ content, components });

  // Update panel record
  setControlPanel(discordUserId, {
    messageId: newMessage.id,
    channelId: interaction.channelId,
    guildId,
    mode,
  });
}

/**
 * Handle music button interactions - move panel down after action
 */
export async function handleMusicButton(
  interaction: ButtonInteraction,
  discordUserId: string,
  action: string,
  guildId: string
): Promise<void> {
  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) return;

  switch (action) {
    case "prev": {
      if (!previous(guildId)) {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
        return;
      }
      break;
    }

    case "skip": {
      if (!skip(guildId)) {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
        return;
      }
      break;
    }

    case "stop": {
      if (!stopVoice(guildId)) {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
        return;
      }
      break;
    }

    case "leave": {
      leaveChannel(guildId);
      const panels = getGuildControlPanels(guildId);
      for (const { userId } of panels) {
        clearControlPanel(userId);
      }
      await interaction.reply({ content: "Left voice channel", ephemeral: true });
      try {
        await interaction.message.delete();
      } catch {
        // Ignore delete errors
      }
      return;
    }

    default:
      await interaction.reply({ content: "Unknown action", ephemeral: true });
      return;
  }

  // Delete old and send new panel at bottom
  try {
    await interaction.message.delete();
  } catch {
    // Ignore delete errors
  }

  const content = buildPanelContent("player", guildId);
  const components = buildPanelComponents("player", guildId);
  const newMessage = await channel.send({ content, components });

  setControlPanel(discordUserId, {
    messageId: newMessage.id,
    channelId: interaction.channelId,
    guildId,
    mode: "player",
  });
}

/**
 * Handle select menu interactions - move panel down after action
 */
export async function handleSelectMenuInteraction(
  interaction: StringSelectMenuInteraction
): Promise<void> {
  const customId = interaction.customId;
  const parts = customId.split(":");
  const discordUserId = interaction.user.id;

  // Handle music select: music:select:guildId
  if (parts[0] === "music" && parts[1] === "select" && parts.length === 3) {
    const guildId = parts[2];
    const selectedIndex = parseInt(interaction.values[0], 10);

    if (!playAt(guildId, selectedIndex)) {
      await interaction.reply({ content: "Failed", ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    if (!channel || !isSendableChannel(channel)) return;

    // Delete old and send new panel at bottom
    try {
      await interaction.message.delete();
    } catch {
      // Ignore delete errors
    }

    const content = buildPanelContent("player", guildId);
    const components = buildPanelComponents("player", guildId);
    const newMessage = await channel.send({ content, components });

    setControlPanel(discordUserId, {
      messageId: newMessage.id,
      channelId: interaction.channelId,
      guildId,
      mode: "player",
    });
    return;
  }

  // Handle dice system select: dice:system:guildId
  if (parts[0] === "dice" && parts[1] === "system" && parts.length === 3) {
    const guildId = parts[2];
    const selectedSystem = interaction.values[0] as GameSystem;
    const channelId = interaction.channelId;

    // Update game system
    setGameSystem(channelId, selectedSystem);

    // Update panel in place
    const dicePanel = getDicePanel(channelId);
    if (dicePanel) {
      const components = buildDiceComponents(guildId, channelId);
      try {
        await interaction.update({ components });
      } catch {
        await interaction.reply({ content: `已切換至 ${selectedSystem}`, ephemeral: true });
      }
    } else {
      await interaction.reply({ content: `已切換至 ${selectedSystem}`, ephemeral: true });
    }
  }
}
