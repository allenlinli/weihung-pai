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
export const SOUNDS: Record<SoundCategory, SoundEffect[]> = {
  dnd: [
    { id: "sword", name: "Sword", file: "sword.mp3" },
    { id: "arrow", name: "Arrow", file: "arrow.mp3" },
    { id: "magic", name: "Magic", file: "magic.mp3" },
    { id: "heal", name: "Heal", file: "heal.mp3" },
    { id: "fire", name: "Fire", file: "fire.mp3" },
    { id: "thunder", name: "Thunder", file: "thunder.mp3" },
    { id: "hit", name: "Hit", file: "hit.mp3" },
    { id: "miss", name: "Miss", file: "miss.mp3" },
    { id: "victory", name: "Victory", file: "victory.mp3" },
    { id: "defeat", name: "Defeat", file: "defeat.mp3" },
  ],
  coc: [
    { id: "heartbeat", name: "Heartbeat", file: "heartbeat.mp3" },
    { id: "whisper", name: "Whisper", file: "whisper.mp3" },
    { id: "scream", name: "Scream", file: "scream.mp3" },
    { id: "door", name: "Door", file: "door.mp3" },
    { id: "footsteps", name: "Footsteps", file: "footsteps.mp3" },
    { id: "wind", name: "Wind", file: "wind.mp3" },
    { id: "rain", name: "Rain", file: "rain.mp3" },
    { id: "clock", name: "Clock", file: "clock.mp3" },
    { id: "glass", name: "Glass", file: "glass.mp3" },
    { id: "laugh", name: "Laugh", file: "laugh.mp3" },
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
