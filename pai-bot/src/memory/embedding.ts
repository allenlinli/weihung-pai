import { config } from "../config";
import { logger } from "../utils/logger";

const EMBEDDING_DIMENSION = 768; // nomic-embed-text dimension

export interface EmbeddingResult {
  embedding: Float32Array;
  dimension: number;
}

export async function getEmbedding(text: string): Promise<EmbeddingResult> {
  const response = await fetch(`${config.ollama.baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollama.embeddingModel,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    logger.error({ error, status: response.status }, "Embedding request failed");
    throw new Error(`Embedding request failed: ${error}`);
  }

  const data = (await response.json()) as { embedding: number[] };
  const embedding = new Float32Array(data.embedding);

  return {
    embedding,
    dimension: embedding.length,
  };
}

export async function getEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  return Promise.all(texts.map(getEmbedding));
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same dimension");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export { EMBEDDING_DIMENSION };
