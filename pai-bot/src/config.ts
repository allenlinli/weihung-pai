// Configuration management

export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    allowedUserIds: (process.env.TELEGRAM_ALLOWED_USER_IDS || "")
      .split(",")
      .filter(Boolean)
      .map((id) => parseInt(id, 10)),
  },
  claude: {
    /** Claude 專案目錄（VPS 上是 ~/merlin，本地開發用 ../pai-claude） */
    projectDir: process.env.CLAUDE_PROJECT_DIR ||
      (process.env.HOME ? `${process.env.HOME}/merlin` : "../pai-claude"),
    /** Claude 執行檔路徑 */
    bin: process.env.CLAUDE_BIN ||
      (process.env.HOME ? `${process.env.HOME}/.local/bin/claude` : "claude"),
  },
  workspace: {
    /** 下載檔案存放目錄 */
    downloadsDir: process.env.WORKSPACE_DOWNLOADS_DIR ||
      (process.env.HOME ? `${process.env.HOME}/merlin/workspace/downloads` : "../pai-claude/workspace/downloads"),
  },
  database: {
    path: process.env.DATABASE_PATH || "./data/pai.db",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || "20", 10),
    window: parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10),
  },
} as const;

// Validate required config
export function validateConfig(): void {
  if (!config.telegram.token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }
  if (config.telegram.allowedUserIds.length === 0) {
    throw new Error("TELEGRAM_ALLOWED_USER_IDS is required");
  }
}
