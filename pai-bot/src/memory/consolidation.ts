import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../storage/db";
import { logger } from "../utils/logger";
import { getEmbedding } from "./embedding";
import { Memory } from "./manager";

const anthropic = new Anthropic();

const CONSOLIDATION_PROMPT = `你是記憶整合器。將以下相似的記憶合併成一條簡潔的陳述。

規則：
1. 保留所有重要資訊
2. 去除重複內容
3. 用一句話表達
4. 保持原本的語氣和細節

記憶列表：
`;

interface MemoryCluster {
  memories: Memory[];
  category: string;
}

/**
 * Find clusters of similar memories for a user
 */
function findSimilarClusters(userId: number, threshold: number = 0.7): MemoryCluster[] {
  const db = getDb();

  // Get all memories for user
  const memories = db
    .query<Memory, [number]>(
      `SELECT rowid as id, user_id as userId, content, category, importance,
              created_at as createdAt, last_accessed as lastAccessed
       FROM vec_memories WHERE user_id = ?
       ORDER BY category, created_at`
    )
    .all(userId);

  if (memories.length < 2) return [];

  // Group by category first
  const byCategory = new Map<string, Memory[]>();
  for (const m of memories) {
    const list = byCategory.get(m.category) || [];
    list.push(m);
    byCategory.set(m.category, list);
  }

  // Find clusters within each category (simple approach: consecutive similar content)
  const clusters: MemoryCluster[] = [];

  for (const [category, mems] of byCategory) {
    if (mems.length < 2) continue;

    // Simple clustering: group memories that share keywords
    const used = new Set<number>();

    for (let i = 0; i < mems.length; i++) {
      if (used.has(mems[i].id)) continue;

      const cluster: Memory[] = [mems[i]];
      used.add(mems[i].id);

      // Find similar memories (simple keyword overlap)
      const words1 = new Set(mems[i].content.toLowerCase().split(/\s+/));

      for (let j = i + 1; j < mems.length; j++) {
        if (used.has(mems[j].id)) continue;

        const words2 = new Set(mems[j].content.toLowerCase().split(/\s+/));
        const intersection = [...words1].filter((w) => words2.has(w) && w.length > 2);
        const similarity = intersection.length / Math.min(words1.size, words2.size);

        if (similarity >= threshold) {
          cluster.push(mems[j]);
          used.add(mems[j].id);
        }
      }

      if (cluster.length >= 2) {
        clusters.push({ memories: cluster, category });
      }
    }
  }

  return clusters;
}

/**
 * Consolidate similar memories using Haiku
 */
export async function consolidateMemories(userId: number): Promise<number> {
  const clusters = findSimilarClusters(userId);

  if (clusters.length === 0) {
    logger.debug({ userId }, "No memory clusters to consolidate");
    return 0;
  }

  const db = getDb();
  let consolidated = 0;

  for (const cluster of clusters) {
    try {
      // Format memories for prompt
      const memoryList = cluster.memories
        .map((m, i) => `${i + 1}. ${m.content}`)
        .join("\n");

      // Call Haiku to consolidate
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: CONSOLIDATION_PROMPT + memoryList,
          },
        ],
      });

      const consolidatedContent =
        response.content[0].type === "text" ? response.content[0].text.trim() : null;

      if (!consolidatedContent) continue;

      // Calculate max importance from cluster
      const maxImportance = Math.max(...cluster.memories.map((m) => m.importance));
      const now = new Date().toISOString();

      // Generate embedding for consolidated memory
      const { embedding } = await getEmbedding(consolidatedContent);
      const embeddingBytes = new Uint8Array(embedding.buffer);

      // Delete old memories
      const ids = cluster.memories.map((m) => m.id);
      const placeholders = ids.map(() => "?").join(",");
      db.run(`DELETE FROM vec_memories WHERE rowid IN (${placeholders})`, ids);

      // Insert consolidated memory
      db.run(
        `INSERT INTO vec_memories(user_id, embedding, content, category, importance, created_at, last_accessed)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, embeddingBytes, consolidatedContent, cluster.category, maxImportance, now, now]
      );

      consolidated++;
      logger.info(
        {
          userId,
          merged: cluster.memories.length,
          category: cluster.category,
          result: consolidatedContent.slice(0, 50),
        },
        "Memories consolidated"
      );
    } catch (error) {
      logger.error({ error, userId, cluster: cluster.category }, "Consolidation failed");
    }
  }

  return consolidated;
}

/**
 * Run consolidation for all users
 */
export async function consolidateAllUsers(): Promise<number> {
  const db = getDb();

  const users = db
    .query<{ userId: number }, []>("SELECT DISTINCT user_id as userId FROM vec_memories")
    .all();

  let total = 0;
  for (const { userId } of users) {
    total += await consolidateMemories(userId);
  }

  if (total > 0) {
    logger.info({ totalConsolidated: total }, "Memory consolidation complete");
  }

  return total;
}
