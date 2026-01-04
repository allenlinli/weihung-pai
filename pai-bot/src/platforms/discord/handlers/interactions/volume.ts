/**
 * Volume Panel Interactions
 */

import { type ButtonInteraction, MessageFlags } from "discord.js";
import {
  adjustVolume,
  fadeIn,
  fadeOut,
  getVolumeState,
  resetVolume,
  toggleMute,
} from "../../voice";
import { buildVolumeComponents, buildVolumeContent } from "../panels/volume";

/**
 * Handle volume button interactions
 */
export async function handleVolumeButton(
  interaction: ButtonInteraction,
  parts: string[],
): Promise<void> {
  const action = parts[1];
  const guildId = parts[2];

  if (!guildId) {
    await interaction.reply({ content: "Invalid interaction", flags: MessageFlags.Ephemeral });
    return;
  }

  const state = getVolumeState(guildId);
  if (!state) {
    await interaction.reply({ content: "Bot 不在語音頻道中", flags: MessageFlags.Ephemeral });
    return;
  }

  switch (action) {
    case "up": {
      adjustVolume(guildId, 5);
      await updatePanel(interaction, guildId);
      return;
    }

    case "down": {
      adjustVolume(guildId, -5);
      await updatePanel(interaction, guildId);
      return;
    }

    case "up10": {
      adjustVolume(guildId, 10);
      await updatePanel(interaction, guildId);
      return;
    }

    case "down10": {
      adjustVolume(guildId, -10);
      await updatePanel(interaction, guildId);
      return;
    }

    case "mute": {
      toggleMute(guildId);
      await updatePanel(interaction, guildId);
      return;
    }

    case "fadeout": {
      await interaction.deferUpdate();
      await fadeOut(guildId, 2000);
      await updatePanelDeferred(interaction, guildId);
      return;
    }

    case "fadein": {
      await interaction.deferUpdate();
      await fadeIn(guildId, 2000);
      await updatePanelDeferred(interaction, guildId);
      return;
    }

    case "reset": {
      resetVolume(guildId);
      await updatePanel(interaction, guildId);
      return;
    }

    default:
      await interaction.reply({ content: "Unknown action", flags: MessageFlags.Ephemeral });
      return;
  }
}

/**
 * Update the volume panel message
 */
async function updatePanel(interaction: ButtonInteraction, guildId: string): Promise<void> {
  const content = buildVolumeContent(guildId);
  const components = buildVolumeComponents(guildId);
  await interaction.update({ content, components });
}

/**
 * Update the volume panel message (deferred)
 */
async function updatePanelDeferred(interaction: ButtonInteraction, guildId: string): Promise<void> {
  const content = buildVolumeContent(guildId);
  const components = buildVolumeComponents(guildId);
  await interaction.editReply({ content, components });
}
