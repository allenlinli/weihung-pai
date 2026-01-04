/**
 * Discord Message Handlers
 *
 * Re-exports all handler functions from submodules.
 */

import type { Client } from "discord.js";
import { setDiscordClient } from "./slash-commands/voice";

/**
 * Initialize handlers with Discord client
 */
export function initializeTaskExecutor(client: Client): void {
  setDiscordClient(client);
}

export { handleAttachment } from "./attachments";
export {
  handleButtonInteraction,
  handleModalSubmit,
  handleSelectMenuInteraction,
} from "./interactions";
// Re-export handlers
export { handleMessage } from "./message";
export { handleSlashCommand } from "./slash-commands";
