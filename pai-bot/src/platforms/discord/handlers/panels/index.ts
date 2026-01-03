/**
 * Control Panels
 */

import type { ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import type { PanelMode, SoundCategory, ControlPanel } from "./types";
import { buildPlayerContent, buildPlayerComponents } from "./player";
import { buildSoundboardContent, buildSoundboardComponents } from "./soundboard";
import { buildDiceContent, buildDiceComponents } from "./dice";

// Re-export types
export type { PanelMode, SoundCategory, ControlPanel } from "./types";

// Re-export panel builders
export { buildPlayerContent, buildPlayerComponents } from "./player";
export { buildSoundboardContent, buildSoundboardComponents } from "./soundboard";
export { buildDiceContent, buildDiceComponents, roll, formatResult, type DiceResult } from "./dice";

/**
 * Build panel content based on mode
 */
export function buildPanelContent(
  mode: PanelMode,
  guildId: string,
  options?: { soundCategory?: SoundCategory }
): string {
  switch (mode) {
    case "player":
      return buildPlayerContent(guildId);
    case "soundboard":
      return buildSoundboardContent(options?.soundCategory ?? "dnd");
    case "dice":
      return buildDiceContent();
  }
}

/**
 * Build panel components based on mode
 */
export function buildPanelComponents(
  mode: PanelMode,
  guildId: string,
  options?: { soundCategory?: SoundCategory }
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  switch (mode) {
    case "player":
      return buildPlayerComponents(guildId);
    case "soundboard":
      return buildSoundboardComponents(guildId, options?.soundCategory ?? "dnd");
    case "dice":
      return buildDiceComponents(guildId);
  }
}
