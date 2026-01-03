/**
 * Discord Button/Select/Modal Interactions Handler
 */

import type {
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import type { PanelMode } from "../panels";

import { handleDiceButton, handleDiceModalSubmit } from "./dice";
import { handlePanelSwitch, handleMusicButton, handleSelectMenuInteraction } from "./music";
import { handleQueueButton } from "./queue";

// Re-export for external use
export { handleSelectMenuInteraction };

/**
 * Handle button interactions
 */
export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const data = interaction.customId;
  const discordUserId = interaction.user.id;

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

  // Handle dice buttons: dice:action:...:guildId
  if (parts[0] === "dice") {
    await handleDiceButton(interaction, discordUserId, parts);
    return;
  }

  // Parse callback data: action:taskId
  const colonIndex = data.indexOf(":");
  if (colonIndex === -1) return;

  const action = data.slice(0, colonIndex);
  const taskId = data.slice(colonIndex + 1);

  if (action === "abort" || action === "queue") {
    await handleQueueButton(interaction, discordUserId, action, taskId);
  }
}

/**
 * Handle modal submit interactions
 */
export async function handleModalSubmit(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const customId = interaction.customId;
  const parts = customId.split(":");
  const discordUserId = interaction.user.id;

  // Handle dice modal: dice:modal:guildId
  if (parts[0] === "dice" && parts[1] === "modal") {
    await handleDiceModalSubmit(interaction, discordUserId);
  }
}
