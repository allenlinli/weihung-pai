// Memory system configuration

/** Maximum memories per user */
export const MAX_MEMORIES_PER_USER = 50;

/** Trigger consolidation when memories exceed this count */
export const CONSOLIDATION_THRESHOLD = 30;

/** Maximum L2 distance for deduplication (lower = stricter) */
export const DEDUP_MAX_DISTANCE = 5.0;

/** Days until memory expires if not accessed */
export const EXPIRY_DAYS = 90;

/** Minimum memories to keep even if expired */
export const MIN_MEMORIES_TO_KEEP = 10;
