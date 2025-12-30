import { config, validateConfig } from "./config";
import { logger } from "./utils/logger";
import { createTelegramBot, setupBotCommands } from "./platforms/telegram/bot";
import { getDb, closeDb } from "./storage/db";
import { startApiServer, setTelegramBot } from "./api/server";
import { startScheduler, stopScheduler, type Schedule } from "./services/scheduler";
import { callClaude } from "./claude/client";

async function main() {
  try {
    // Validate configuration
    validateConfig();
    logger.info("Configuration validated");

    // Initialize database
    getDb();
    logger.info("Database ready");

    // Create Telegram bot
    const bot = createTelegramBot();

    // Start API server for MCP integration
    const apiPort = parseInt(process.env.API_PORT || "3000", 10);
    const apiServer = startApiServer(apiPort);

    // Inject Telegram bot into API server
    setTelegramBot(
      {
        sendMessage: async (userId: number, text: string) => {
          await bot.api.sendMessage(userId, text, { parse_mode: "Markdown" });
        },
      },
      config.telegram.allowedUserIds
    );

    // Task executor for scheduler
    const executeScheduledTask = async (schedule: Schedule) => {
      const taskData = schedule.task_data;

      if (schedule.task_type === "message") {
        // 直接發送訊息
        await bot.api.sendMessage(schedule.user_id, taskData);
      } else if (schedule.task_type === "prompt") {
        // 執行 Claude prompt 並發送結果
        try {
          const result = await callClaude(taskData);
          if (result.response) {
            await bot.api.sendMessage(schedule.user_id, result.response);
          }
        } catch (error) {
          logger.error({ error, scheduleId: schedule.id }, "Failed to execute Claude prompt");
          await bot.api.sendMessage(
            schedule.user_id,
            `排程任務「${schedule.name}」執行失敗`
          );
        }
      }
    };

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("Shutting down...");
      stopScheduler();
      await bot.stop();
      apiServer.stop();
      closeDb();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    // Register bot commands
    await setupBotCommands(bot);

    // Start scheduler
    startScheduler(executeScheduledTask);

    // Start bot
    logger.info("Starting Telegram bot...");
    await bot.start({
      onStart: (botInfo) => {
        logger.info(
          { username: botInfo.username },
          "Bot started successfully"
        );
      },
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start bot");
    process.exit(1);
  }
}

main();
