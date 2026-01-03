/**
 * Session Storage Service
 * Manages platform info for notifications
 */

import { getDb } from "./db";
import { logger } from "../utils/logger";

export type Platform = "telegram" | "discord";
export type SessionType = "dm" | "channel";

export interface Session {
  session_id: number;
  platform: Platform;
  platform_user_id: string | null;
  chat_id: string | null;
  channel_id: string | null;
  guild_id: string | null;
  session_type: SessionType;
  is_hq: number;
  created_at: string;
  updated_at: string;
}

export interface UpsertSessionParams {
  sessionId: number;
  platform: Platform;
  platformUserId?: string;
  chatId?: string;
  channelId?: string;
  guildId?: string;
  sessionType: SessionType;
}

class SessionService {
  /**
   * Create or update a session
   */
  upsert(params: UpsertSessionParams): void {
    const db = getDb();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO sessions (session_id, platform, platform_user_id, chat_id, channel_id, guild_id, session_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET
         platform = excluded.platform,
         platform_user_id = COALESCE(excluded.platform_user_id, sessions.platform_user_id),
         chat_id = COALESCE(excluded.chat_id, sessions.chat_id),
         channel_id = COALESCE(excluded.channel_id, sessions.channel_id),
         guild_id = COALESCE(excluded.guild_id, sessions.guild_id),
         session_type = excluded.session_type,
         updated_at = excluded.updated_at`,
      [
        params.sessionId,
        params.platform,
        params.platformUserId || null,
        params.chatId || null,
        params.channelId || null,
        params.guildId || null,
        params.sessionType,
        now,
        now,
      ]
    );

    logger.debug(
      { sessionId: params.sessionId, platform: params.platform },
      "Session upserted"
    );
  }

  /**
   * Get session by ID
   */
  get(sessionId: number): Session | null {
    const db = getDb();
    const result = db
      .query("SELECT * FROM sessions WHERE session_id = ?")
      .get(sessionId) as Session | null;
    return result;
  }

  /**
   * Get all sessions for a platform
   */
  getByPlatform(platform: Platform): Session[] {
    const db = getDb();
    return db
      .query(
        "SELECT * FROM sessions WHERE platform = ? ORDER BY updated_at DESC"
      )
      .all(platform) as Session[];
  }

  /**
   * Get all sessions
   */
  getAll(): Session[] {
    const db = getDb();
    return db
      .query("SELECT * FROM sessions ORDER BY updated_at DESC")
      .all() as Session[];
  }

  /**
   * Delete a session
   */
  delete(sessionId: number): boolean {
    const db = getDb();
    const result = db.run("DELETE FROM sessions WHERE session_id = ?", [
      sessionId,
    ]);
    return result.changes > 0;
  }

  /**
   * Set a session as HQ (clears previous HQ)
   */
  setHQ(sessionId: number): boolean {
    const db = getDb();

    // Clear all existing HQ
    db.run("UPDATE sessions SET is_hq = 0 WHERE is_hq = 1");

    // Set new HQ
    const result = db.run(
      "UPDATE sessions SET is_hq = 1 WHERE session_id = ?",
      [sessionId]
    );

    if (result.changes > 0) {
      logger.info({ sessionId }, "HQ session set");
      return true;
    }
    return false;
  }

  /**
   * Get current HQ session
   */
  getHQ(): Session | null {
    const db = getDb();
    return db
      .query("SELECT * FROM sessions WHERE is_hq = 1 LIMIT 1")
      .get() as Session | null;
  }

  /**
   * Clear HQ status
   */
  clearHQ(): void {
    const db = getDb();
    db.run("UPDATE sessions SET is_hq = 0 WHERE is_hq = 1");
    logger.info("HQ session cleared");
  }
}

export const sessionService = new SessionService();
