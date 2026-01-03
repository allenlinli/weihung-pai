/**
 * Soundboard Panel
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { buildModeSwitcher } from "./mode-switcher";
import { SOUNDS, type SoundCategory } from "../../sounds";

/**
 * Build sound buttons for a category
 */
function buildSoundButtons(
  guildId: string,
  category: SoundCategory
): ActionRowBuilder<ButtonBuilder>[] {
  const sounds = SOUNDS[category];
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  // Discord allows max 5 buttons per row, max 5 rows total
  // We have mode switcher + category switcher = 2 rows
  // So we can have 3 rows of sounds = 15 sounds max
  const maxSounds = 15;
  const soundsToShow = sounds.slice(0, maxSounds);

  for (let i = 0; i < soundsToShow.length; i += 5) {
    const rowSounds = soundsToShow.slice(i, i + 5);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      ...rowSounds.map((sound) =>
        new ButtonBuilder()
          .setCustomId(`sound:${category}-${sound.id}:${guildId}`)
          .setLabel(sound.name)
          .setStyle(ButtonStyle.Secondary)
      )
    );
    rows.push(row);
  }

  return rows;
}

/**
 * Build category switcher row
 */
function buildCategorySwitcher(
  guildId: string,
  currentCategory: SoundCategory
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`soundcat:dnd:${guildId}`)
      .setLabel("DND")
      .setStyle(currentCategory === "dnd" ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`soundcat:coc:${guildId}`)
      .setLabel("CoC")
      .setStyle(currentCategory === "coc" ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
}

/**
 * Build soundboard panel content
 */
export function buildSoundboardContent(category: SoundCategory): string {
  const categoryName = category === "dnd" ? "DND" : "CoC";
  return `**[Soundboard - ${categoryName}]**\n\nPlay sound effects for your session.`;
}

/**
 * Build all components for soundboard panel
 */
export function buildSoundboardComponents(
  guildId: string,
  category: SoundCategory = "dnd"
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

  // Mode switcher
  components.push(buildModeSwitcher(guildId, "soundboard") as ActionRowBuilder<MessageActionRowComponentBuilder>);

  // Category switcher
  components.push(buildCategorySwitcher(guildId, category) as ActionRowBuilder<MessageActionRowComponentBuilder>);

  // Sound buttons (up to 3 rows)
  const soundRows = buildSoundButtons(guildId, category);
  for (const row of soundRows) {
    components.push(row as ActionRowBuilder<MessageActionRowComponentBuilder>);
  }

  return components;
}
