/**
 * Volume Control Panel
 * 音量控制面板：+、-、靜音、淡入、淡出、重置
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { getVolumeState, type VolumeState } from "../../voice";

// Per-channel volume panel tracking
export interface VolumePanel {
  messageId: string;
  channelId: string;
  guildId: string;
}

const volumePanels = new Map<string, VolumePanel>(); // channelId -> VolumePanel

export function setVolumePanel(channelId: string, panel: VolumePanel): void {
  volumePanels.set(channelId, panel);
}

export function getVolumePanel(channelId: string): VolumePanel | undefined {
  return volumePanels.get(channelId);
}

export function clearVolumePanel(channelId: string): void {
  volumePanels.delete(channelId);
}

/**
 * Build volume panel content
 */
export function buildVolumeContent(guildId: string): string {
  const state = getVolumeState(guildId);
  if (!state) {
    return "**[Volume]** Bot 不在語音頻道中";
  }
  return formatVolumeDisplay(state);
}

/**
 * Format volume display
 */
export function formatVolumeDisplay(state: VolumeState): string {
  const bar = buildVolumeBar(state.volume);
  const muteIcon = state.muted ? "🔇" : "🔊";
  return `**[Volume]** ${muteIcon} ${bar} ${state.volume}%`;
}

/**
 * Build volume bar visualization
 */
function buildVolumeBar(volume: number): string {
  const filled = Math.round(volume / 10);
  const empty = 10 - filled;
  return "▓".repeat(filled) + "░".repeat(empty);
}

/**
 * Build volume control buttons
 * Layout:
 * Row 1: [-10] [-] [🔇 Mute] [+] [+10]
 * Row 2: [Fade Out] [Fade In] [Reset]
 */
export function buildVolumeComponents(
  guildId: string,
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  const state = getVolumeState(guildId);
  const muteLabel = state?.muted ? "🔊 Unmute" : "🔇 Mute";

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`vol:down10:${guildId}`)
      .setLabel("-10")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`vol:down:${guildId}`)
      .setLabel("-")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`vol:mute:${guildId}`)
      .setLabel(muteLabel)
      .setStyle(state?.muted ? ButtonStyle.Success : ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`vol:up:${guildId}`)
      .setLabel("+")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`vol:up10:${guildId}`)
      .setLabel("+10")
      .setStyle(ButtonStyle.Secondary),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`vol:fadeout:${guildId}`)
      .setLabel("Fade Out")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`vol:fadein:${guildId}`)
      .setLabel("Fade In")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`vol:reset:${guildId}`)
      .setLabel("Reset")
      .setStyle(ButtonStyle.Secondary),
  );

  return [
    row1 as ActionRowBuilder<MessageActionRowComponentBuilder>,
    row2 as ActionRowBuilder<MessageActionRowComponentBuilder>,
  ];
}
