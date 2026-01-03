/**
 * Panel Types
 */

export type PanelMode = "dice";

export interface ControlPanel {
  messageId: string;
  channelId: string;
  guildId: string;
  mode: PanelMode;
}
