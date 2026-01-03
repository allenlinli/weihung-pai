/**
 * Control Panels
 */

import type { ActionRowBuilder, MessageActionRowComponentBuilder } from "discord.js";
import type { PanelMode, ControlPanel } from "./types";
import { buildPlayerContent, buildPlayerComponents } from "./player";
import { buildDiceContent, buildDiceComponents } from "./dice";

// Re-export types
export type { PanelMode, ControlPanel } from "./types";

// Re-export panel builders
export { buildPlayerContent, buildPlayerComponents } from "./player";
export {
  buildDiceContent,
  buildDiceComponents,
  roll,
  formatResult,
  parseAndRoll,
  addDie,
  undoLastDie,
  clearDiceState,
  rollAccumulatedDice,
  getDiceState,
  type DiceResult,
  type DiceType,
} from "./dice";

export interface PanelOptions {
  userId?: string;
  displayName?: string;
}

/**
 * Build panel content based on mode
 */
export function buildPanelContent(mode: PanelMode, guildId: string, options?: PanelOptions): string {
  switch (mode) {
    case "player":
      return buildPlayerContent(guildId);
    case "dice":
      return buildDiceContent(options?.userId || "", options?.displayName);
  }
}

/**
 * Build panel components based on mode
 */
export function buildPanelComponents(
  mode: PanelMode,
  guildId: string,
  options?: PanelOptions
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  switch (mode) {
    case "player":
      return buildPlayerComponents(guildId);
    case "dice":
      return buildDiceComponents(guildId, options?.userId || "");
  }
}
