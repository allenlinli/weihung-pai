/**
 * Sound Effects Definition
 */

import { join } from "node:path";

export type SoundCategory = "dnd" | "coc";

export interface SoundEffect {
  id: string;
  name: string;
  file: string;
}

// Sound effects by category
// TODO: Add more sounds from YouTube Studio Audio Library
export const SOUNDS: Record<SoundCategory, SoundEffect[]> = {
  dnd: [
    { id: "hit", name: "Hit", file: "hit.mp3" },
    { id: "fire", name: "Fire", file: "fire.mp3" },
    { id: "victory", name: "Victory", file: "victory.mp3" },
  ],
  coc: [
    { id: "scream", name: "Scream", file: "scream.mp3" },
    { id: "whisper", name: "Whisper", file: "whisper.mp3" },
    { id: "bones", name: "Bones", file: "bones.mp3" },
  ],
};

// Base path for sound files
const SOUNDS_BASE_PATH = join(import.meta.dir, "../../../assets/sounds");

/**
 * Get full path to a sound file
 */
export function getSoundPath(category: SoundCategory, soundId: string): string | null {
  const sounds = SOUNDS[category];
  const sound = sounds.find((s) => s.id === soundId);
  if (!sound) return null;
  return join(SOUNDS_BASE_PATH, category, sound.file);
}

/**
 * Get sounds for a category
 */
export function getSoundsForCategory(category: SoundCategory): SoundEffect[] {
  return SOUNDS[category];
}
