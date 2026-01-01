import Anthropic from "@anthropic-ai/sdk";
import { logger } from "../utils/logger";
import { memoryManager } from "./manager";

const anthropic = new Anthropic();

interface ExtractedFact {
  content: string;
  category: string;
  importance: number;
}

const EXTRACTION_PROMPT = `你是一個記憶萃取器。分析以下對話，萃取值得長期記住的事實。

規則：
1. 只萃取關於用戶的具體事實（偏好、習慣、個人資訊、重要事件）
2. 不要萃取一般性知識或對話細節
3. 每個事實用一句話描述
4. 分類：preference（偏好）、personal（個人資訊）、event（事件）、work（工作相關）
5. 重要性 1-5（5 最重要）

輸出 JSON 陣列，若無值得記住的事實則輸出空陣列 []：
[{"content": "事實描述", "category": "分類", "importance": 數字}]

對話內容：
`;

export async function extractAndSaveMemories(
  userId: number,
  userMessage: string,
  assistantMessage: string
): Promise<number> {
  try {
    const conversation = `用戶: ${userMessage}\n助手: ${assistantMessage}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + conversation,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      logger.debug({ userId }, "No facts extracted");
      return 0;
    }

    const facts: ExtractedFact[] = JSON.parse(jsonMatch[0]);

    if (facts.length === 0) {
      return 0;
    }

    // Save each fact
    let savedCount = 0;
    for (const fact of facts) {
      try {
        await memoryManager.save({
          userId,
          content: fact.content,
          category: fact.category,
          importance: fact.importance,
        });
        savedCount++;
      } catch (error) {
        logger.warn({ error, fact }, "Failed to save memory");
      }
    }

    logger.info({ userId, extracted: facts.length, saved: savedCount }, "Memories extracted");
    return savedCount;
  } catch (error) {
    logger.error({ error, userId }, "Memory extraction failed");
    return 0;
  }
}

export function formatMemoriesForPrompt(memories: { content: string; category: string }[]): string {
  if (memories.length === 0) return "";

  const grouped = memories.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m.content);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const lines = ["[Long-term memories about this user]"];
  for (const [category, facts] of Object.entries(grouped)) {
    lines.push(`${category}:`);
    for (const fact of facts) {
      lines.push(`  - ${fact}`);
    }
  }

  return lines.join("\n");
}
