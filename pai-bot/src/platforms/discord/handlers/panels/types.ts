/**
 * Panel Types
 */

export type PanelMode = "player" | "dice";

export interface ControlPanel {
  messageId: string;
  channelId: string;
  guildId: string;
  mode: PanelMode;
}
