// Core
export { memoryManager, MemoryManager } from "./manager";
export type { Memory, MemoryInput } from "./manager";

// Embedding
export { getEmbedding, getEmbeddings, EMBEDDING_DIMENSION } from "./embedding";

// Extraction
export { extractAndSaveMemories, formatMemoriesForPrompt } from "./extractor";

// Maintenance
export { cleanupExpiredMemories, getMemoryStats } from "./maintenance";

// Consolidation
export { consolidateMemories, consolidateAllUsers } from "./consolidation";

// Config
export * from "./constants";
