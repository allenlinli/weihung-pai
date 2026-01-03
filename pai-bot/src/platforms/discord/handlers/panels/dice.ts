/**
 * Dice Panel (TRPG Dice Roller)
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { buildModeSwitcher } from "./mode-switcher";

// Dice types
const DICE_ROW_1 = ["d4", "d6", "d8", "d10", "d12"] as const;
const DICE_ROW_2 = ["d20", "d100"] as const;

export type DiceType = typeof DICE_ROW_1[number] | typeof DICE_ROW_2[number];

export interface DiceResult {
  type: DiceType;
  rolls: number[];
  total: number;
  modifier?: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

/**
 * Roll a die
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll dice with optional advantage/disadvantage
 */
export function roll(
  type: DiceType,
  options?: { advantage?: boolean; disadvantage?: boolean; modifier?: number }
): DiceResult {
  const sides = parseInt(type.slice(1), 10);
  const { advantage, disadvantage, modifier } = options ?? {};

  let rolls: number[];
  let total: number;

  if (advantage || disadvantage) {
    const roll1 = rollDie(sides);
    const roll2 = rollDie(sides);
    rolls = [roll1, roll2];
    total = advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
  } else {
    const result = rollDie(sides);
    rolls = [result];
    total = result;
  }

  if (modifier) {
    total += modifier;
  }

  return { type, rolls, total, modifier, advantage, disadvantage };
}

/**
 * Format dice result for display
 */
export function formatResult(result: DiceResult): string {
  const { type, rolls, total, modifier, advantage, disadvantage } = result;

  let text = `**${type}**: `;

  if (advantage || disadvantage) {
    const kept = advantage ? Math.max(...rolls) : Math.min(...rolls);
    text += `[${rolls.join(", ")}] → **${kept}**`;
    text += advantage ? " (Adv)" : " (Dis)";
  } else {
    text += `**${rolls[0]}**`;
  }

  if (modifier) {
    const sign = modifier > 0 ? "+" : "";
    text += ` ${sign}${modifier} = **${total}**`;
  }

  // Special results for d20
  if (type === "d20") {
    const baseRoll = advantage || disadvantage
      ? (advantage ? Math.max(...rolls) : Math.min(...rolls))
      : rolls[0];
    if (baseRoll === 20) {
      text += " Critical!";
    } else if (baseRoll === 1) {
      text += " Fumble!";
    }
  }

  // Special results for d100 (CoC style)
  if (type === "d100") {
    const baseRoll = rolls[0];
    if (baseRoll === 1) {
      text += " Critical Success!";
    } else if (baseRoll === 100) {
      text += " Critical Failure!";
    }
  }

  return text;
}

/**
 * Build dice buttons row 1 (d4-d12)
 */
function buildDiceRow1(guildId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...DICE_ROW_1.map((dice) =>
      new ButtonBuilder()
        .setCustomId(`dice:${dice}:${guildId}`)
        .setLabel(dice.toUpperCase())
        .setStyle(ButtonStyle.Secondary)
    )
  );
}

/**
 * Build dice buttons row 2 (d20, d100, advantage, disadvantage)
 */
function buildDiceRow2(guildId: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    ...DICE_ROW_2.map((dice) =>
      new ButtonBuilder()
        .setCustomId(`dice:${dice}:${guildId}`)
        .setLabel(dice.toUpperCase())
        .setStyle(dice === "d20" ? ButtonStyle.Primary : ButtonStyle.Secondary)
    ),
    new ButtonBuilder()
      .setCustomId(`dice:adv:${guildId}`)
      .setLabel("Adv")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`dice:dis:${guildId}`)
      .setLabel("Dis")
      .setStyle(ButtonStyle.Danger)
  );
}

/**
 * Build dice panel content
 */
export function buildDiceContent(): string {
  return "**[Dice]**\n\nRoll dice for your TRPG session.\nAdv/Dis: Roll 2d20, keep highest/lowest.";
}

/**
 * Build all components for dice panel
 */
export function buildDiceComponents(
  guildId: string
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  return [
    buildModeSwitcher(guildId, "dice") as ActionRowBuilder<MessageActionRowComponentBuilder>,
    buildDiceRow1(guildId) as ActionRowBuilder<MessageActionRowComponentBuilder>,
    buildDiceRow2(guildId) as ActionRowBuilder<MessageActionRowComponentBuilder>,
  ];
}
