/**
 * Task Queue Manager using p-queue
 * 管理 Claude 任務佇列，支援打斷和排隊功能
 */

import PQueue from "p-queue";
import { logger } from "../utils/logger";

export interface QueuedTask {
  id: string;
  userId: number;
  chatId: number;
  prompt: string;
  history: string;
  memoryContext: string;
  createdAt: Date;
}

interface PendingDecision {
  taskId: string;
  messageId: number;
  timeoutId: Timer;
}

class QueueManager {
  // 每個用戶一個獨立的佇列
  private queues: Map<number, PQueue> = new Map();

  // 待決定的任務（等待使用者按按鈕）
  private pendingDecisions: Map<number, PendingDecision> = new Map();

  // 暫存等待決定的任務
  private pendingTasks: Map<string, QueuedTask> = new Map();

  // 已開始執行的任務 ID（用於判斷過時請求）
  private startedTasks: Set<string> = new Set();

  /**
   * 取得或建立用戶的佇列
   */
  private getQueue(userId: number): PQueue {
    let queue = this.queues.get(userId);
    if (!queue) {
      queue = new PQueue({ concurrency: 1 });

      queue.on("active", () => {
        logger.debug({ userId, size: queue!.size, pending: queue!.pending }, "Task started");
      });

      queue.on("idle", () => {
        logger.debug({ userId }, "Queue idle");
      });

      queue.on("error", (error) => {
        logger.error({ userId, error }, "Queue task error");
      });

      this.queues.set(userId, queue);
    }
    return queue;
  }

  /**
   * 生成唯一任務 ID
   */
  generateTaskId(): string {
    return crypto.randomUUID();
  }

  /**
   * 暫存任務（等待使用者決定）
   */
  storePendingTask(task: QueuedTask): void {
    this.pendingTasks.set(task.id, task);
    logger.debug({ taskId: task.id, userId: task.userId }, "Task stored pending decision");
  }

  /**
   * 取得暫存的任務
   */
  getPendingTask(taskId: string): QueuedTask | undefined {
    return this.pendingTasks.get(taskId);
  }

  /**
   * 移除暫存的任務
   */
  removePendingTask(taskId: string): void {
    this.pendingTasks.delete(taskId);
  }

  /**
   * 加入佇列
   */
  async enqueue(task: QueuedTask, executor: (task: QueuedTask) => Promise<void>): Promise<void> {
    const queue = this.getQueue(task.userId);

    // 從暫存移除
    this.pendingTasks.delete(task.id);

    logger.info({ taskId: task.id, userId: task.userId, queueSize: queue.size }, "Task enqueued");

    // 加入佇列並執行
    await queue.add(async () => {
      this.markTaskStarted(task.id);
      try {
        await executor(task);
      } finally {
        this.startedTasks.delete(task.id);
      }
    });
  }

  /**
   * 立即執行任務（不經過佇列）
   */
  async executeImmediately(
    task: QueuedTask,
    executor: (task: QueuedTask) => Promise<void>,
  ): Promise<void> {
    // 從暫存移除
    this.pendingTasks.delete(task.id);

    this.markTaskStarted(task.id);
    try {
      await executor(task);
    } finally {
      this.startedTasks.delete(task.id);
    }
  }

  /**
   * 清空佇列（打斷時使用）
   */
  clearQueue(userId: number): number {
    const queue = this.queues.get(userId);
    if (!queue) return 0;

    const clearedCount = queue.size;
    queue.clear();
    logger.info({ userId, clearedCount }, "Queue cleared");
    return clearedCount;
  }

  /**
   * 設定待決定狀態
   */
  setPendingDecision(userId: number, decision: PendingDecision): void {
    // 清除之前的待決定（如果有）
    this.cancelPendingDecision(userId);
    this.pendingDecisions.set(userId, decision);
  }

  /**
   * 取消待決定並回傳資訊
   */
  cancelPendingDecision(userId: number): PendingDecision | undefined {
    const pending = this.pendingDecisions.get(userId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingDecisions.delete(userId);
    }
    return pending;
  }

  /**
   * 檢查是否有待決定
   */
  hasPendingDecision(userId: number): boolean {
    return this.pendingDecisions.has(userId);
  }

  /**
   * 標記任務已開始
   */
  markTaskStarted(taskId: string): void {
    this.startedTasks.add(taskId);
    logger.debug({ taskId }, "Task marked as started");
  }

  /**
   * 檢查任務是否已開始（過時請求判斷）
   */
  isTaskStarted(taskId: string): boolean {
    return this.startedTasks.has(taskId);
  }

  /**
   * 取得佇列長度
   */
  getQueueLength(userId: number): number {
    const queue = this.queues.get(userId);
    return queue ? queue.size : 0;
  }

  /**
   * 檢查是否有任務正在執行
   */
  isProcessing(userId: number): boolean {
    const queue = this.queues.get(userId);
    return queue ? queue.pending > 0 : false;
  }

  /**
   * 取得狀態資訊
   */
  getStatus(userId: number): { queueSize: number; isProcessing: boolean } {
    const queue = this.queues.get(userId);
    return {
      queueSize: queue?.size ?? 0,
      isProcessing: queue ? queue.pending > 0 : false,
    };
  }
}

export const queueManager = new QueueManager();
