/**
 * Control Panels - Dice only (Spotify controlled via app)
 */

import type { ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import type { PanelMode, ControlPanel } from "./types";
import { buildDiceContent, buildDiceComponents } from "./dice";

// Re-export types
export type { PanelMode, ControlPanel } from "./types";

// Re-export panel builders
export {
  buildDiceContent,
  buildDiceComponents,
  buildCustomDiceModal,
  roll,
  formatResult,
  parseAndRoll,
  addDie,
  undoLastDie,
  clearDiceState,
  rollAccumulatedDice,
  formatAccumulatedDice,
  getDiceState,
  setDicePanel,
  getDicePanel,
  clearDicePanel,
  setGameSystem,
  GAME_SYSTEM_PRESETS,
  GAME_SYSTEM_LABELS,
  type DiceResult,
  type DiceType,
  type DicePanel,
  type GameSystem,
} from "./dice";

/**
 * Build panel content based on mode
 */
export function buildPanelContent(mode: PanelMode, guildId: string): string {
  return buildDiceContent();
}

/**
 * Build panel components based on mode
 */
export function buildPanelComponents(
  mode: PanelMode,
  guildId: string,
  channelId?: string
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  return buildDiceComponents(guildId, channelId);
}
