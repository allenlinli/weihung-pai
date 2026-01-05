/**
 * Memory 工具 - 讀取 pai-bot 的 SQLite 記憶
 */

import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { join } from "node:path";

// pai-bot 資料庫路徑
const DB_PATH = process.env.PAI_DB_PATH || join(process.env.HOME || "", "pai-bot/data/pai.db");

// 預設 user_id（從環境變數取得）
const DEFAULT_USER_ID = parseInt(process.env.TELEGRAM_ALLOWED_USER_IDS?.split(",")[0] || "0", 10);

export interface Memory {
  id: number;
  content: string;
  category: string;
  importance: number;
  createdAt: string;
}

/**
 * 取得最近的記憶
 */
export function getRecentMemories(limit: number = 10): Memory[] {
  if (!existsSync(DB_PATH)) {
    return [];
  }

  try {
    const db = new Database(DB_PATH, { readonly: true });
    const memories = db
      .query<Memory, [number, number]>(
        `SELECT id, content, category, importance, created_at as createdAt
         FROM memories
         WHERE user_id = ?
         ORDER BY importance DESC, created_at DESC
         LIMIT ?`
      )
      .all(DEFAULT_USER_ID, limit);
    db.close();
    return memories;
  } catch {
    return [];
  }
}

/**
 * 取得高重要性記憶
 */
export function getImportantMemories(minImportance: number = 4): Memory[] {
  if (!existsSync(DB_PATH)) {
    return [];
  }

  try {
    const db = new Database(DB_PATH, { readonly: true });
    const memories = db
      .query<Memory, [number, number]>(
        `SELECT id, content, category, importance, created_at as createdAt
         FROM memories
         WHERE user_id = ? AND importance >= ?
         ORDER BY importance DESC, created_at DESC`
      )
      .all(DEFAULT_USER_ID, minImportance);
    db.close();
    return memories;
  } catch {
    return [];
  }
}

/**
 * 取得記憶統計
 */
export function getMemoryStats(): { total: number; byCategory: Record<string, number> } {
  if (!existsSync(DB_PATH)) {
    return { total: 0, byCategory: {} };
  }

  try {
    const db = new Database(DB_PATH, { readonly: true });

    const total = db
      .query<{ count: number }, [number]>(
        "SELECT COUNT(*) as count FROM memories WHERE user_id = ?"
      )
      .get(DEFAULT_USER_ID)?.count || 0;

    const categories = db
      .query<{ category: string; count: number }, [number]>(
        `SELECT category, COUNT(*) as count
         FROM memories WHERE user_id = ?
         GROUP BY category`
      )
      .all(DEFAULT_USER_ID);

    db.close();

    const byCategory: Record<string, number> = {};
    for (const c of categories) {
      byCategory[c.category] = c.count;
    }

    return { total, byCategory };
  } catch {
    return { total: 0, byCategory: {} };
  }
}

/**
 * 格式化記憶為 context 字串
 */
export function formatMemoriesForContext(memories: Memory[]): string {
  if (memories.length === 0) return "";

  const lines = ["[Long-term Memory]"];

  // 按分類分組
  const byCategory = new Map<string, Memory[]>();
  for (const m of memories) {
    const list = byCategory.get(m.category) || [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  for (const [category, mems] of byCategory) {
    lines.push(`\n## ${category}`);
    for (const m of mems) {
      const importance = "★".repeat(m.importance);
      lines.push(`- ${m.content} ${importance}`);
    }
  }

  return lines.join("\n");
}
