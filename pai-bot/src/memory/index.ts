// Core

// Consolidation
export { consolidateAllUsers, consolidateMemories } from "./consolidation";
// Config
export * from "./constants";

// Extraction
export { extractAndSaveMemories, formatMemoriesForPrompt } from "./extractor";

// Maintenance
export { cleanupExpiredMemories, getMemoryStats } from "./maintenance";
export type { Memory, MemoryInput } from "./manager";
export { MemoryManager, memoryManager } from "./manager";
