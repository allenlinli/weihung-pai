import { getDb } from "../storage/db";
import { logger } from "../utils/logger";
import { getEmbedding, EMBEDDING_DIMENSION, cosineSimilarity } from "./embedding";
import { SIMILARITY_THRESHOLD, MAX_MEMORIES_PER_USER, CONSOLIDATION_THRESHOLD } from "./constants";
import { consolidateMemories } from "./consolidation";
import * as sqliteVec from "sqlite-vec";

export interface Memory {
  id: number;
  userId: number;
  content: string;
  category: string;
  importance: number;
  createdAt: string;
  lastAccessed?: string;
  distance?: number;
}

export interface MemoryInput {
  userId: number;
  content: string;
  category?: string;
  importance?: number;
}

let vecInitialized = false;

function initVec(): void {
  if (vecInitialized) return;

  const db = getDb();
  sqliteVec.load(db);

  db.run(`
    CREATE VIRTUAL TABLE IF NOT EXISTS vec_memories USING vec0(
      user_id INTEGER,
      embedding FLOAT[${EMBEDDING_DIMENSION}],
      +content TEXT,
      +category TEXT,
      +importance INTEGER,
      +created_at TEXT,
      +last_accessed TEXT
    )
  `);

  vecInitialized = true;
  logger.info("Vector memory table initialized");
}

export class MemoryManager {
  constructor() {
    initVec();
  }

  /**
   * Save a memory with semantic deduplication
   * Returns existing id if similar memory found, new id otherwise
   */
  async save(input: MemoryInput): Promise<number | null> {
    const db = getDb();
    const { userId, content, category = "general", importance = 0 } = input;

    const { embedding } = await getEmbedding(content);
    const embeddingBytes = new Uint8Array(embedding.buffer);

    // Check for semantically similar memories
    const similar = await this.findSimilar(userId, embedding, SIMILARITY_THRESHOLD);
    if (similar) {
      logger.debug(
        { userId, existingId: similar.id, similarity: 1 - (similar.distance ?? 0) },
        "Similar memory exists, skipping"
      );
      return null;
    }

    const now = new Date().toISOString();
    const result = db.run(
      `INSERT INTO vec_memories(user_id, embedding, content, category, importance, created_at, last_accessed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, embeddingBytes, content, category, importance, now, now]
    );

    const newId = Number(result.lastInsertRowid);
    logger.info({ userId, category, importance, id: newId }, "Memory saved");

    // Trigger consolidation if threshold exceeded (async, don't block)
    const count = this.count(userId);
    if (count > CONSOLIDATION_THRESHOLD) {
      consolidateMemories(userId).catch((error) => {
        logger.warn({ error, userId }, "Background consolidation failed");
      });
    }

    // Enforce capacity limit
    await this.enforceLimit(userId);

    return newId;
  }

  /**
   * Find similar memory by embedding
   */
  private async findSimilar(
    userId: number,
    embedding: Float32Array,
    threshold: number
  ): Promise<Memory | null> {
    const db = getDb();
    const embeddingBytes = new Uint8Array(embedding.buffer);

    // sqlite-vec distance is L2, convert threshold to distance
    // For normalized vectors: distance ≈ 2 * (1 - cosine_similarity)
    const maxDistance = 2 * (1 - threshold);

    const result = db
      .query<Memory, [Uint8Array, number]>(
        `SELECT rowid as id, user_id as userId, content, category, importance,
                created_at as createdAt, last_accessed as lastAccessed, distance
         FROM vec_memories
         WHERE embedding MATCH ? AND user_id = ?
         ORDER BY distance LIMIT 1`
      )
      .get(embeddingBytes, userId);

    if (result && (result.distance ?? Infinity) < maxDistance) {
      return result;
    }
    return null;
  }

  /**
   * Search memories by semantic similarity
   */
  async search(userId: number, query: string, limit: number = 5): Promise<Memory[]> {
    const db = getDb();
    const { embedding } = await getEmbedding(query);
    const embeddingBytes = new Uint8Array(embedding.buffer);

    const results = db
      .query<Memory, [Uint8Array, number, number]>(
        `SELECT rowid as id, user_id as userId, content, category, importance,
                created_at as createdAt, last_accessed as lastAccessed, distance
         FROM vec_memories
         WHERE embedding MATCH ? AND user_id = ?
         ORDER BY distance LIMIT ?`
      )
      .all(embeddingBytes, userId, limit);

    // Update last_accessed for retrieved memories
    if (results.length > 0) {
      const ids = results.map((r) => r.id);
      this.touchMemories(ids);
    }

    return results;
  }

  /**
   * Update last_accessed timestamp
   */
  private touchMemories(ids: number[]): void {
    if (ids.length === 0) return;
    const db = getDb();
    const now = new Date().toISOString();
    const placeholders = ids.map(() => "?").join(",");
    db.run(
      `UPDATE vec_memories SET last_accessed = ? WHERE rowid IN (${placeholders})`,
      [now, ...ids]
    );
  }

  /**
   * Enforce per-user memory limit by removing lowest priority memories
   */
  private async enforceLimit(userId: number): Promise<void> {
    const count = this.count(userId);
    if (count <= MAX_MEMORIES_PER_USER) return;

    const db = getDb();
    const toRemove = count - MAX_MEMORIES_PER_USER;

    // Delete lowest importance, then oldest last_accessed
    db.run(
      `DELETE FROM vec_memories WHERE rowid IN (
        SELECT rowid FROM vec_memories
        WHERE user_id = ?
        ORDER BY importance ASC, last_accessed ASC
        LIMIT ?
      )`,
      [userId, toRemove]
    );

    logger.info({ userId, removed: toRemove }, "Enforced memory limit");
  }

  /**
   * Get recent memories
   */
  getRecent(userId: number, limit: number = 10): Memory[] {
    const db = getDb();
    return db
      .query<Memory, [number, number]>(
        `SELECT rowid as id, user_id as userId, content, category, importance,
                created_at as createdAt, last_accessed as lastAccessed
         FROM vec_memories WHERE user_id = ?
         ORDER BY created_at DESC LIMIT ?`
      )
      .all(userId, limit);
  }

  /**
   * Count memories for a user
   */
  count(userId: number): number {
    const db = getDb();
    const result = db
      .query<{ count: number }, [number]>(
        "SELECT COUNT(*) as count FROM vec_memories WHERE user_id = ?"
      )
      .get(userId);
    return result?.count ?? 0;
  }

  /**
   * Delete a single memory
   */
  delete(id: number): boolean {
    const db = getDb();
    const result = db.run("DELETE FROM vec_memories WHERE rowid = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Delete all memories for a user
   */
  deleteByUser(userId: number): number {
    const db = getDb();
    const result = db.run("DELETE FROM vec_memories WHERE user_id = ?", [userId]);
    logger.info({ userId, deleted: result.changes }, "User memories deleted");
    return result.changes;
  }
}

export const memoryManager = new MemoryManager();
