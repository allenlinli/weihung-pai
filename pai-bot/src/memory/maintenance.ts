import { getDb } from "../storage/db";
import { logger } from "../utils/logger";
import { EXPIRY_DAYS, MIN_MEMORIES_TO_KEEP } from "./constants";

/**
 * Remove memories that haven't been accessed in EXPIRY_DAYS
 * Keeps at least MIN_MEMORIES_TO_KEEP per user
 */
export function cleanupExpiredMemories(): number {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRY_DAYS);
  const cutoffStr = cutoff.toISOString();

  // Get users with expired memories
  const users = db
    .query<{ userId: number; total: number; expired: number }, [string]>(
      `SELECT
        user_id as userId,
        COUNT(*) as total,
        SUM(CASE WHEN last_accessed < ? THEN 1 ELSE 0 END) as expired
       FROM memories
       GROUP BY user_id
       HAVING expired > 0`
    )
    .all(cutoffStr);

  let totalDeleted = 0;

  for (const { userId, total, expired } of users) {
    // Calculate how many we can safely delete
    const canDelete = Math.max(0, total - MIN_MEMORIES_TO_KEEP);
    const toDelete = Math.min(expired, canDelete);

    if (toDelete > 0) {
      db.run(
        `DELETE FROM memories WHERE id IN (
          SELECT id FROM memories
          WHERE user_id = ? AND last_accessed < ?
          ORDER BY importance ASC, last_accessed ASC
          LIMIT ?
        )`,
        [userId, cutoffStr, toDelete]
      );
      totalDeleted += toDelete;
    }
  }

  if (totalDeleted > 0) {
    logger.info({ deleted: totalDeleted, expiryDays: EXPIRY_DAYS }, "Cleaned up expired memories");
  }

  return totalDeleted;
}

/**
 * Get memory statistics
 */
export function getMemoryStats(): {
  totalMemories: number;
  totalUsers: number;
  avgPerUser: number;
  oldestMemory: string | null;
} {
  const db = getDb();

  const stats = db
    .query<{ total: number; users: number }, []>(
      `SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as users FROM memories`
    )
    .get();

  const oldest = db
    .query<{ createdAt: string }, []>(
      `SELECT created_at as createdAt FROM memories ORDER BY created_at ASC LIMIT 1`
    )
    .get();

  return {
    totalMemories: stats?.total ?? 0,
    totalUsers: stats?.users ?? 0,
    avgPerUser: stats?.users ? Math.round((stats.total / stats.users) * 10) / 10 : 0,
    oldestMemory: oldest?.createdAt ?? null,
  };
}
