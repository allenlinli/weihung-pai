/**
 * Voice Slash Commands (join, leave, spotify, say, panel, roll)
 */

import type { ChatInputCommandInteraction, Client } from "discord.js";
import {
  joinChannel,
  leaveChannel,
  startSpotifyConnect,
  stopSpotifyConnect,
  isSpotifyConnected,
  isInVoiceChannel,
  setControlPanel,
  clearControlPanel,
  getGuildControlPanels,
  speakTts,
} from "../../voice";
import { buildPanelContent, buildPanelComponents, parseAndRoll, setDicePanel, type PanelMode } from "../panels";

// Discord client reference (set by index.ts)
let discordClient: Client | null = null;

export function setDiscordClient(client: Client): void {
  discordClient = client;
}

export async function handleJoin(
  interaction: ChatInputCommandInteraction,
  discordUserId: string
): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: "此指令只能在伺服器中使用", ephemeral: true });
    return;
  }

  const member = await interaction.guild.members.fetch(discordUserId);
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: "請先加入一個語音頻道", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const result = await joinChannel(voiceChannel);

  if (result.ok) {
    const content = buildPanelContent("player", interaction.guildId!);
    const components = buildPanelComponents("player", interaction.guildId!);
    const reply = await interaction.editReply({
      content,
      components,
    });

    setControlPanel(discordUserId, {
      messageId: reply.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId!,
      mode: "player",
    });
  } else {
    await interaction.editReply(`無法加入: ${result.error}`);
  }
}

export async function handleLeave(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: "此指令只能在伺服器中使用", ephemeral: true });
    return;
  }

  if (!isInVoiceChannel(interaction.guildId)) {
    await interaction.reply({ content: "Bot 不在語音頻道中", ephemeral: true });
    return;
  }

  const panels = getGuildControlPanels(interaction.guildId);
  for (const { userId } of panels) {
    clearControlPanel(userId);
  }

  leaveChannel(interaction.guildId);
  await interaction.reply("Left voice channel");
}

export async function handleSpotify(
  interaction: ChatInputCommandInteraction,
  discordUserId: string
): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: "此指令只能在伺服器中使用", ephemeral: true });
    return;
  }

  // Check if already connected
  if (isSpotifyConnected(interaction.guildId)) {
    // Stop Spotify Connect
    stopSpotifyConnect(interaction.guildId);
    await interaction.reply("🎵 Spotify Connect 已停止");
    return;
  }

  // Auto-join if not in voice channel
  if (!isInVoiceChannel(interaction.guildId)) {
    const member = await interaction.guild!.members.fetch(discordUserId);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({ content: "請先加入一個語音頻道，或使用 /join", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const joinResult = await joinChannel(voiceChannel);
    if (!joinResult.ok) {
      await interaction.editReply(`無法加入: ${joinResult.error}`);
      return;
    }
  } else {
    await interaction.deferReply();
  }

  const result = await startSpotifyConnect(interaction.guildId);

  if (result.ok) {
    await interaction.editReply(
      "🎵 **Spotify Connect 已啟動**\n\n" +
      "在 Spotify app 中選擇 **Merlin DJ** 設備即可播放音樂\n" +
      "再次使用 `/spotify` 可停止"
    );
  } else {
    await interaction.editReply(`錯誤: ${result.error}`);
  }
}

export async function handleSay(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: "此指令只能在伺服器中使用", ephemeral: true });
    return;
  }

  if (!isInVoiceChannel(interaction.guildId)) {
    await interaction.reply({ content: "Bot 不在語音頻道中，請先使用 /join", ephemeral: true });
    return;
  }

  const text = interaction.options.getString("text", true);
  await interaction.deferReply();

  const result = await speakTts(interaction.guildId, text);

  if (result.ok) {
    await interaction.editReply(`Said: "${text.slice(0, 100)}${text.length > 100 ? "..." : ""}"`);
  } else {
    await interaction.editReply(`TTS failed: ${result.error}`);
  }
}

export async function handlePanel(
  interaction: ChatInputCommandInteraction,
  discordUserId: string
): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply({ content: "此指令只能在伺服器中使用", ephemeral: true });
    return;
  }

  const modeInput = interaction.options.getString("mode")?.toLowerCase();
  let mode: PanelMode = "dice";
  if (modeInput === "player" || modeInput === "p") mode = "player";
  else if (modeInput === "dice" || modeInput === "d") mode = "dice";

  // Dice mode doesn't require voice channel
  if (mode === "dice") {
    // Send history message first
    const historyMsg = await interaction.reply({ content: "**擲骰歷史**\n—", fetchReply: true });

    // Send panel message
    const content = buildPanelContent(mode, interaction.guildId);
    const components = buildPanelComponents(mode, interaction.guildId);
    const panelMsg = await interaction.followUp({ content, components, fetchReply: true });

    // Track the dice panel
    setDicePanel(interaction.channelId, {
      historyMessageId: historyMsg.id,
      panelMessageId: panelMsg.id,
      channelId: interaction.channelId,
      gameSystem: "generic",
    });

    setControlPanel(discordUserId, {
      messageId: panelMsg.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      mode,
    });
    return;
  }

  // Player and Soundboard modes require voice channel
  if (!isInVoiceChannel(interaction.guildId)) {
    // Try to auto-join
    const member = await interaction.guild!.members.fetch(discordUserId);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({
        content: "請先加入語音頻道，或使用 /join",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    const joinResult = await joinChannel(voiceChannel);
    if (!joinResult.ok) {
      await interaction.editReply(`無法加入: ${joinResult.error}`);
      return;
    }

    const content = buildPanelContent(mode, interaction.guildId);
    const components = buildPanelComponents(mode, interaction.guildId);
    const reply = await interaction.editReply({ content, components });

    setControlPanel(discordUserId, {
      messageId: reply.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      mode,
    });
  } else {
    const content = buildPanelContent(mode, interaction.guildId);
    const components = buildPanelComponents(mode, interaction.guildId);
    const reply = await interaction.reply({ content, components, fetchReply: true });

    setControlPanel(discordUserId, {
      messageId: reply.id,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      mode,
    });
  }
}

export async function handleRoll(interaction: ChatInputCommandInteraction): Promise<void> {
  const diceExpr = interaction.options.getString("dice", true);
  const result = parseAndRoll(diceExpr);

  if (!result) {
    await interaction.reply({
      content: "無效的骰子表達式。範例: d20, 2d6+3, 3d8-2",
      ephemeral: true,
    });
    return;
  }

  await interaction.reply(result.text);
}
