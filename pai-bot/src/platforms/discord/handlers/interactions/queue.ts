/**
 * Queue Task Interactions
 */

import { type ButtonInteraction, MessageFlags } from "discord.js";
import { abortUserProcess } from "../../../../claude/client";
import { queueManager } from "../../../../claude/queue-manager";
import { logger } from "../../../../utils/logger";
import { executeClaudeTask, getPendingDecisions } from "../message";
import { isSendableChannel, toNumericId } from "../utils";

/**
 * Handle queue task button interactions (abort/queue)
 */
export async function handleQueueButton(
  interaction: ButtonInteraction,
  discordUserId: string,
  action: string,
  taskId: string,
): Promise<void> {
  const userId = toNumericId(discordUserId);

  logger.debug({ userId, action, taskId }, "Button interaction received");

  // Check if task already started
  if (queueManager.isTaskStarted(taskId)) {
    await interaction.reply({ content: "Task already started", flags: MessageFlags.Ephemeral });
    return;
  }

  // Cancel timeout
  const pendingDecisions = getPendingDecisions();
  const pending = pendingDecisions.get(discordUserId);
  if (pending && pending.taskId === taskId) {
    clearTimeout(pending.timeoutId);
    pendingDecisions.delete(discordUserId);
  }

  // Get pending task
  const task = queueManager.getPendingTask(taskId);
  if (!task) {
    await interaction.reply({ content: "Task expired", flags: MessageFlags.Ephemeral });
    return;
  }

  // Update original message to remove buttons
  try {
    await interaction.update({ components: [] });
  } catch {
    // Ignore update errors
  }

  const channel = interaction.channel;
  if (!channel || !isSendableChannel(channel)) return;

  if (action === "abort") {
    // Abort current task and clear queue
    abortUserProcess(userId);
    const clearedCount = queueManager.clearQueue(userId);

    logger.info({ userId, taskId, clearedCount }, "Task interrupted, queue cleared");

    await channel.send("Interrupted. Starting new task...");

    // Execute immediately
    queueManager.removePendingTask(taskId);
    await queueManager.executeImmediately(task, async (t) => {
      await executeClaudeTask(t, channel);
    });
  } else if (action === "queue") {
    // Queue the task
    const queueLength = queueManager.getQueueLength(userId) + 1;

    await channel.send(`Queued (position: ${queueLength})`);

    logger.info({ userId, taskId, position: queueLength }, "Task queued");

    queueManager
      .enqueue(task, async (t) => {
        await executeClaudeTask(t, channel);
      })
      .catch((error) => {
        logger.error({ error, taskId }, "Queued task failed");
      });
  }
}
