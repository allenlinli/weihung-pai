/**
 * Discord Button/Select Interactions Handler
 */

import type { ButtonInteraction, StringSelectMenuInteraction } from "discord.js";
import { abortUserProcess } from "../../../claude/client";
import { queueManager } from "../../../claude/queue-manager";
import { logger } from "../../../utils/logger";
import {
  skip,
  stop as stopVoice,
  leaveChannel,
  getGuildControlPanels,
  clearControlPanel,
  previous,
  playAt,
  getControlPanel,
  setControlPanel,
  playSoundEffect,
} from "../voice";
import { getSoundPath, type SoundCategory } from "../sounds";
import { toNumericId, isSendableChannel } from "./utils";
import {
  buildPanelContent,
  buildPanelComponents,
  roll,
  formatResult,
  type PanelMode,
  type DiceResult,
} from "./panels";
import { executeClaudeTask, getPendingDecisions } from "./message";

/**
 * Handle button interactions
 */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const data = interaction.customId;
  const discordUserId = interaction.user.id;
  const userId = toNumericId(discordUserId);

  // Parse callback data
  const parts = data.split(":");

  // Handle panel mode switch: panel:mode:guildId
  if (parts[0] === "panel" && parts.length === 3) {
    await handlePanelSwitch(interaction, discordUserId, parts[1] as PanelMode, parts[2]);
    return;
  }

  // Handle music buttons: music:action:guildId
  if (parts[0] === "music" && parts.length === 3) {
    await handleMusicButton(interaction, discordUserId, parts[1], parts[2]);
    return;
  }

  // Handle sound buttons: sound:category-id:guildId
  if (parts[0] === "sound" && parts.length === 3) {
    await handleSoundButton(interaction, parts[1], parts[2]);
    return;
  }

  // Handle sound category switch: soundcat:category:guildId
  if (parts[0] === "soundcat" && parts.length === 3) {
    await handleSoundCategorySwitch(interaction, discordUserId, parts[1] as SoundCategory, parts[2]);
    return;
  }

  // Handle dice buttons: dice:type:guildId
  if (parts[0] === "dice" && parts.length === 3) {
    await handleDiceButton(interaction, parts[1], parts[2]);
    return;
  }

  // Parse callback data: action:taskId
  const colonIndex = data.indexOf(":");
  if (colonIndex === -1) return;

  const action = data.slice(0, colonIndex);
  const taskId = data.slice(colonIndex + 1);

  if (action !== "abort" && action !== "queue") return;

  logger.debug({ userId, action, taskId }, "Button interaction received");

  // Check if task already started
  if (queueManager.isTaskStarted(taskId)) {
    await interaction.reply({ content: "Task already started", ephemeral: true });
    return;
  }

  // Cancel timeout
  const pendingDecisions = getPendingDecisions();
  const pending = pendingDecisions.get(discordUserId);
  if (pending && pending.taskId === taskId) {
    clearTimeout(pending.timeoutId);
    pendingDecisions.delete(discordUserId);
  }

  // Get pending task
  const task = queueManager.getPendingTask(taskId);
  if (!task) {
    await interaction.reply({ content: "Task expired", ephemeral: true });
    return;
  }

  // Update original message to remove buttons
  try {
    await interaction.update({ components: [] });
  } catch {
    // Ignore update errors
  }

  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) return;

  if (action === "abort") {
    // Abort current task and clear queue
    abortUserProcess(userId);
    const clearedCount = queueManager.clearQueue(userId);

    logger.info({ userId, taskId, clearedCount }, "Task interrupted, queue cleared");

    await channel.send("Interrupted. Starting new task...");

    // Execute immediately
    queueManager.removePendingTask(taskId);
    await queueManager.executeImmediately(task, async (t) => {
      await executeClaudeTask(t, channel);
    });
  } else if (action === "queue") {
    // Queue the task
    const queueLength = queueManager.getQueueLength(userId) + 1;

    await channel.send(`Queued (position: ${queueLength})`);

    logger.info({ userId, taskId, position: queueLength }, "Task queued");

    queueManager.enqueue(task, async (t) => {
      await executeClaudeTask(t, channel);
    }).catch((error) => {
      logger.error({ error, taskId }, "Queued task failed");
    });
  }
}

/**
 * Handle panel mode switch
 */
async function handlePanelSwitch(
  interaction: ButtonInteraction,
  discordUserId: string,
  mode: PanelMode,
  guildId: string
): Promise<void> {
  const panel = getControlPanel(discordUserId);
  const soundCategory = panel?.soundCategory ?? "dnd";

  // Update panel mode
  setControlPanel(discordUserId, {
    messageId: interaction.message.id,
    channelId: interaction.channelId,
    guildId,
    mode,
    soundCategory,
  });

  // Update message
  const content = buildPanelContent(mode, guildId, { soundCategory });
  const components = buildPanelComponents(mode, guildId, { soundCategory });

  try {
    await interaction.update({ content, components });
  } catch (error) {
    logger.debug({ error }, "Failed to update panel");
  }
}

/**
 * Handle music button interactions
 */
async function handleMusicButton(
  interaction: ButtonInteraction,
  discordUserId: string,
  action: string,
  guildId: string
): Promise<void> {
  const panel = getControlPanel(discordUserId);

  switch (action) {
    case "prev": {
      if (previous(guildId)) {
        await interaction.reply({ content: "Replaying current track", ephemeral: true });
        await updatePanelMessage(interaction, guildId, panel);
      } else {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
      }
      break;
    }

    case "skip": {
      if (skip(guildId)) {
        await interaction.reply({ content: "Skipped", ephemeral: true });
        await updatePanelMessage(interaction, guildId, panel);
      } else {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
      }
      break;
    }

    case "stop": {
      if (stopVoice(guildId)) {
        await interaction.reply({ content: "Stopped and cleared queue", ephemeral: true });
        await updatePanelMessage(interaction, guildId, panel);
      } else {
        await interaction.reply({ content: "Nothing playing", ephemeral: true });
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
      break;
    }

    default:
      await interaction.reply({ content: "Unknown action", ephemeral: true });
  }
}

/**
 * Handle sound button interactions
 */
async function handleSoundButton(
  interaction: ButtonInteraction,
  soundInfo: string,
  guildId: string
): Promise<void> {
  // soundInfo format: category-soundId (e.g., "dnd-sword")
  const [category, soundId] = soundInfo.split("-") as [SoundCategory, string];

  const soundPath = getSoundPath(category, soundId);
  if (!soundPath) {
    await interaction.reply({ content: "Sound not found", ephemeral: true });
    return;
  }

  const result = await playSoundEffect(guildId, soundPath);
  if (result.ok) {
    await interaction.reply({ content: `Playing: ${soundId}`, ephemeral: true });
  } else {
    await interaction.reply({ content: result.error, ephemeral: true });
  }
}

/**
 * Handle sound category switch
 */
async function handleSoundCategorySwitch(
  interaction: ButtonInteraction,
  discordUserId: string,
  category: SoundCategory,
  guildId: string
): Promise<void> {
  const panel = getControlPanel(discordUserId);

  // Update panel with new category
  setControlPanel(discordUserId, {
    messageId: interaction.message.id,
    channelId: interaction.channelId,
    guildId,
    mode: "soundboard",
    soundCategory: category,
  });

  // Update message
  const content = buildPanelContent("soundboard", guildId, { soundCategory: category });
  const components = buildPanelComponents("soundboard", guildId, { soundCategory: category });

  try {
    await interaction.update({ content, components });
  } catch (error) {
    logger.debug({ error }, "Failed to update soundboard");
  }
}

/**
 * Handle dice button interactions
 */
async function handleDiceButton(
  interaction: ButtonInteraction,
  diceType: string,
  guildId: string
): Promise<void> {
  let result: DiceResult;

  if (diceType === "adv") {
    result = roll("d20", { advantage: true });
  } else if (diceType === "dis") {
    result = roll("d20", { disadvantage: true });
  } else if (diceType.startsWith("d")) {
    result = roll(diceType as any);
  } else {
    await interaction.reply({ content: "Unknown dice type", ephemeral: true });
    return;
  }

  const formatted = formatResult(result);
  await interaction.reply({ content: formatted, ephemeral: false });
}

/**
 * Handle select menu interactions
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
    const panel = getControlPanel(discordUserId);

    if (playAt(guildId, selectedIndex)) {
      await interaction.reply({
        content: `Jumping to track ${selectedIndex + 1}`,
        ephemeral: true,
      });
      await updatePanelMessageFromSelect(interaction, guildId, panel);
    } else {
      await interaction.reply({ content: "Failed", ephemeral: true });
    }
  }
}

/**
 * Update panel message (from button interaction)
 */
async function updatePanelMessage(
  interaction: ButtonInteraction,
  guildId: string,
  panel?: { mode?: PanelMode; soundCategory?: SoundCategory }
): Promise<void> {
  try {
    const mode = panel?.mode ?? "player";
    const content = buildPanelContent(mode, guildId, { soundCategory: panel?.soundCategory });
    const components = buildPanelComponents(mode, guildId, { soundCategory: panel?.soundCategory });
    await interaction.message.edit({ content, components });
  } catch (error) {
    logger.debug({ error, guildId }, "Failed to update panel message");
  }
}

/**
 * Update panel message (from select menu interaction)
 */
async function updatePanelMessageFromSelect(
  interaction: StringSelectMenuInteraction,
  guildId: string,
  panel?: { mode?: PanelMode; soundCategory?: SoundCategory }
): Promise<void> {
  try {
    const mode = panel?.mode ?? "player";
    const content = buildPanelContent(mode, guildId, { soundCategory: panel?.soundCategory });
    const components = buildPanelComponents(mode, guildId, { soundCategory: panel?.soundCategory });
    await interaction.message.edit({ content, components });
  } catch (error) {
    logger.debug({ error, guildId }, "Failed to update panel message");
  }
}
