// Memory system configuration

/** Maximum memories per user */
export const MAX_MEMORIES_PER_USER = 50;

/** Trigger consolidation when memories exceed this count */
export const CONSOLIDATION_THRESHOLD = 30;

/** Similarity threshold for deduplication (0-1, higher = stricter) */
export const SIMILARITY_THRESHOLD = 0.85;

/** Days until memory expires if not accessed */
export const EXPIRY_DAYS = 90;

/** Minimum memories to keep even if expired */
export const MIN_MEMORIES_TO_KEEP = 10;
