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

// Re-export handlers
export { handleMessage } from "./message";
export { handleButtonInteraction, handleSelectMenuInteraction, handleModalSubmit } from "./interactions";
export { handleSlashCommand } from "./slash-commands";
export { handleAttachment } from "./attachments";
