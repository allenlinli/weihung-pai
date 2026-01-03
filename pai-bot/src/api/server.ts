/**
 * HTTP API Server
 * 提供基本的 API endpoints
 */

import type { Client as DiscordClient, TextChannel } from "discord.js";
import { logger } from "../utils/logger";
import * as google from "../services/google";
import { sessionService, type Session } from "../storage/sessions";

// Telegram bot 實例（稍後注入）
let telegramBot: {
  sendMessage: (userId: number, text: string) => Promise<void>;
} | null = null;

// Discord client 實例（稍後注入）
let discordClient: DiscordClient | null = null;

// 允許的用戶 ID
let allowedUserIds: number[] = [];

export function setTelegramBot(
  bot: typeof telegramBot,
  userIds: number[]
) {
  telegramBot = bot;
  allowedUserIds = userIds;
}

export function setDiscordClient(client: DiscordClient) {
  discordClient = client;
}

/**
 * 透過 session 發送通知
 */
async function notifyBySession(session: Session, message: string): Promise<void> {
  if (session.platform === "telegram") {
    if (!telegramBot || !session.chat_id) {
      throw new Error("Telegram bot not configured or missing chat_id");
    }
    await telegramBot.sendMessage(parseInt(session.chat_id), message);
  } else if (session.platform === "discord") {
    if (!discordClient || !session.channel_id) {
      throw new Error("Discord client not configured or missing channel_id");
    }
    const channel = await discordClient.channels.fetch(session.channel_id);
    if (!channel || !channel.isTextBased()) {
      throw new Error("Discord channel not found or not text-based");
    }
    await (channel as TextChannel).send(message);
  }
}

/**
 * 啟動 HTTP API server
 */
export function startApiServer(port = 3000) {
  const server = Bun.serve({
    port,
    hostname: "127.0.0.1", // 只監聽本機，不暴露到公網
    async fetch(req) {
      const url = new URL(req.url);
      const path = url.pathname;
      const method = req.method;

      try {
        // Health check
        if (path === "/health" && method === "GET") {
          return Response.json({ status: "ok" });
        }

        // Notify API - sends to HQ session (fallback to allowedUserIds[0])
        if (path === "/api/notify" && method === "POST") {
          const body = await req.json();
          const { message, level = "info" } = body;

          if (!message) {
            return Response.json({ error: "Missing message" }, { status: 400 });
          }

          const icons: Record<string, string> = {
            info: "ℹ️",
            warning: "⚠️",
            error: "❌",
            success: "✅",
          };
          const icon = icons[level] || icons.info;
          const formattedMessage = `${icon} ${message}`;

          // Try HQ session first
          const hqSession = sessionService.getHQ();
          if (hqSession) {
            try {
              await notifyBySession(hqSession, formattedMessage);
              return Response.json({ success: true, target: "hq", platform: hqSession.platform });
            } catch (error) {
              logger.warn({ error }, "Failed to notify HQ, falling back to default");
            }
          }

          // Fallback to allowedUserIds[0]
          if (!telegramBot || allowedUserIds.length === 0) {
            return Response.json({ error: "No HQ configured and Telegram bot not available" }, { status: 500 });
          }

          await telegramBot.sendMessage(allowedUserIds[0], formattedMessage);
          return Response.json({ success: true, target: "fallback" });
        }

        // Session-based notify API
        if (path === "/api/notify/session" && method === "POST") {
          const body = await req.json();
          const { sessionId, message }: { sessionId: number; message: string } = body;

          if (!sessionId || !message) {
            return Response.json({ error: "Missing sessionId or message" }, { status: 400 });
          }

          const session = sessionService.get(sessionId);
          if (!session) {
            return Response.json({ error: "Session not found" }, { status: 404 });
          }

          await notifyBySession(session, message);
          return Response.json({ success: true, platform: session.platform });
        }

        // List sessions API
        if (path === "/api/sessions" && method === "GET") {
          const platform = url.searchParams.get("platform");
          const sessions = platform
            ? sessionService.getByPlatform(platform as "telegram" | "discord")
            : sessionService.getAll();
          return Response.json({ sessions });
        }

        // Get session API
        if (path.startsWith("/api/sessions/") && method === "GET") {
          const id = parseInt(path.split("/").pop()!);
          if (isNaN(id)) {
            return Response.json({ error: "Invalid session ID" }, { status: 400 });
          }
          const session = sessionService.get(id);
          if (!session) {
            return Response.json({ error: "Session not found" }, { status: 404 });
          }
          return Response.json({ session });
        }

        // === Google APIs ===

        // Status
        if (path === "/api/google/status" && method === "GET") {
          return Response.json({ configured: google.isGoogleConfigured() });
        }

        // Calendar - list calendars
        if (path === "/api/google/calendar/list" && method === "GET") {
          const calendars = await google.calendar.listCalendars();
          return Response.json({ calendars });
        }

        // Calendar - events
        if (path === "/api/google/calendar/events") {
          if (method === "GET") {
            const calendarId = url.searchParams.get("calendarId") || "primary";
            const timeMin = url.searchParams.get("timeMin") || undefined;
            const timeMax = url.searchParams.get("timeMax") || undefined;
            const maxResults = parseInt(url.searchParams.get("maxResults") || "10");
            const q = url.searchParams.get("q") || undefined;

            const events = await google.calendar.listEvents(calendarId, {
              timeMin,
              timeMax,
              maxResults,
              q,
            });
            return Response.json({ events });
          }
          if (method === "POST") {
            const body = await req.json();
            const { event, calendarId = "primary" } = body;
            const created = await google.calendar.createEvent(event, calendarId);
            return Response.json({ event: created });
          }
        }

        // Drive - list files
        if (path === "/api/google/drive/files" && method === "GET") {
          const q = url.searchParams.get("q") || undefined;
          const folderId = url.searchParams.get("folderId") || undefined;
          const pageSize = parseInt(url.searchParams.get("pageSize") || "20");

          const files = await google.drive.listFiles({ q, folderId, pageSize });
          return Response.json({ files });
        }

        // Drive - search
        if (path === "/api/google/drive/search" && method === "GET") {
          const query = url.searchParams.get("query");
          if (!query) {
            return Response.json({ error: "query required" }, { status: 400 });
          }
          const files = await google.drive.searchFiles(query);
          return Response.json({ files });
        }

        // Drive - get file
        if (path.startsWith("/api/google/drive/file/") && method === "GET") {
          const id = path.split("/").pop()!;
          const content = url.searchParams.get("content") === "true";

          if (content) {
            const data = await google.drive.getFileContent(id);
            return Response.json({ content: data });
          } else {
            const file = await google.drive.getFile(id);
            return Response.json({ file });
          }
        }

        // Gmail - list messages
        if (path === "/api/google/gmail/messages" && method === "GET") {
          const q = url.searchParams.get("q") || undefined;
          const maxResults = parseInt(url.searchParams.get("maxResults") || "10");

          const messages = await google.gmail.listMessages({ q, maxResults });
          return Response.json({ messages });
        }

        // Gmail - get message
        if (path.startsWith("/api/google/gmail/message/") && method === "GET") {
          const id = path.split("/").pop()!;
          const message = await google.gmail.getMessageContent(id);
          return Response.json({ message });
        }

        // Gmail - send
        if (path === "/api/google/gmail/send" && method === "POST") {
          const body = await req.json();
          const { to, subject, body: messageBody, cc, bcc } = body;
          if (!to || !subject || !messageBody) {
            return Response.json({ error: "to, subject, body required" }, { status: 400 });
          }
          const result = await google.gmail.sendMessage(to, subject, messageBody, { cc, bcc });
          return Response.json({ result });
        }

        // Contacts - list
        if (path === "/api/google/contacts" && method === "GET") {
          const pageSize = parseInt(url.searchParams.get("pageSize") || "100");
          const result = await google.contacts.listContacts({ pageSize });
          return Response.json(result);
        }

        // Contacts - search
        if (path === "/api/google/contacts/search" && method === "GET") {
          const query = url.searchParams.get("query");
          if (!query) {
            return Response.json({ error: "query required" }, { status: 400 });
          }
          const contacts = await google.contacts.searchContacts(query);
          return Response.json({ contacts });
        }

        // 404
        return Response.json({ error: "Not found" }, { status: 404 });

      } catch (error) {
        logger.error({ error, path }, "API error");
        return Response.json({ error: String(error) }, { status: 500 });
      }
    },
  });

  logger.info({ port }, "API server started");
  return server;
}
