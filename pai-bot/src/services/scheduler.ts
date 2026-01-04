import CronExpressionParser from "cron-parser";
import { getDb } from "../storage/db";
import { logger } from "../utils/logger";

const TIMEZONE = process.env.TIMEZONE || "Asia/Taipei";
const CHECK_INTERVAL_MS = 60 * 1000; // 每分鐘檢查

// 設定環境時區
process.env.TZ = TIMEZONE;

export interface Schedule {
  id: number;
  name: string;
  cron_expression: string | null;
  run_at: string | null;
  task_type: "message" | "prompt";
  task_data: string;
  user_id: number;
  enabled: number;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
}

export interface CreateScheduleInput {
  name: string;
  cronExpression?: string;
  runAt?: string; // ISO 8601
  taskType: "message" | "prompt";
  taskData: string;
  userId: number;
}

export interface UpdateScheduleInput {
  id: number;
  name?: string;
  cronExpression?: string | null;
  runAt?: string | null;
  taskType?: "message" | "prompt";
  taskData?: string;
  enabled?: boolean;
}

export interface ScheduleLog {
  id: number;
  schedule_id: number;
  status: "success" | "error";
  result: string | null;
  error_message: string | null;
  executed_at: string;
}

export interface TaskResult {
  success: boolean;
  result?: string;
  error?: string;
}

type TaskExecutor = (schedule: Schedule) => Promise<TaskResult>;

let intervalId: ReturnType<typeof setInterval> | null = null;
let taskExecutor: TaskExecutor | null = null;

// 計算下次執行時間
function calculateNextRun(cronExpression: string): Date | null {
  try {
    const interval = CronExpressionParser.parse(cronExpression, {
      tz: TIMEZONE,
    });
    return interval.next().toDate();
  } catch (error) {
    logger.error({ error, cronExpression }, "Failed to parse cron expression");
    return null;
  }
}

// 創建排程
export function createSchedule(input: CreateScheduleInput): Schedule | null {
  const db = getDb();

  let nextRun: string | null = null;

  if (input.cronExpression) {
    const next = calculateNextRun(input.cronExpression);
    if (!next) return null;
    nextRun = next.toISOString();
  } else if (input.runAt) {
    nextRun = new Date(input.runAt).toISOString();
  }

  const stmt = db.prepare(`
    INSERT INTO schedules (name, cron_expression, run_at, task_type, task_data, user_id, next_run)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.name,
    input.cronExpression || null,
    input.runAt || null,
    input.taskType,
    input.taskData,
    input.userId,
    nextRun,
  );

  const id = Number(result.lastInsertRowid);
  return getScheduleById(id);
}

// 取得單一排程
export function getScheduleById(id: number): Schedule | null {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM schedules WHERE id = ?");
  return stmt.get(id) as Schedule | null;
}

// 列出所有排程
export function listSchedules(userId?: number): Schedule[] {
  const db = getDb();

  if (userId) {
    const stmt = db.prepare("SELECT * FROM schedules WHERE user_id = ? ORDER BY created_at DESC");
    return stmt.all(userId) as Schedule[];
  }

  const stmt = db.prepare("SELECT * FROM schedules ORDER BY created_at DESC");
  return stmt.all() as Schedule[];
}

// 刪除排程
export function deleteSchedule(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM schedules WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// 更新排程
export function updateSchedule(input: UpdateScheduleInput): Schedule | null {
  const db = getDb();
  const existing = getScheduleById(input.id);
  if (!existing) return null;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.name !== undefined) {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (input.taskType !== undefined) {
    updates.push("task_type = ?");
    values.push(input.taskType);
  }

  if (input.taskData !== undefined) {
    updates.push("task_data = ?");
    values.push(input.taskData);
  }

  if (input.enabled !== undefined) {
    updates.push("enabled = ?");
    values.push(input.enabled ? 1 : 0);
  }

  // 處理排程時間變更
  if (input.cronExpression !== undefined || input.runAt !== undefined) {
    const newCron = input.cronExpression ?? null;
    const newRunAt = input.runAt ?? null;

    updates.push("cron_expression = ?");
    values.push(newCron);

    updates.push("run_at = ?");
    values.push(newRunAt);

    // 計算新的 next_run
    let nextRun: string | null = null;
    if (newCron) {
      const next = calculateNextRun(newCron);
      if (!next) return null; // cron 表達式無效
      nextRun = next.toISOString();
    } else if (newRunAt) {
      nextRun = new Date(newRunAt).toISOString();
    }

    updates.push("next_run = ?");
    values.push(nextRun);
  }

  if (updates.length === 0) {
    return existing;
  }

  values.push(input.id);
  const stmt = db.prepare(`UPDATE schedules SET ${updates.join(", ")} WHERE id = ?`);
  stmt.run(...values);

  return getScheduleById(input.id);
}

// 記錄執行結果
export function logScheduleExecution(
  scheduleId: number,
  status: "success" | "error",
  result?: string,
  errorMessage?: string,
): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO schedule_logs (schedule_id, status, result, error_message)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(scheduleId, status, result || null, errorMessage || null);
}

// 取得排程執行記錄
export function getScheduleLogs(scheduleId: number, limit = 10): ScheduleLog[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM schedule_logs
    WHERE schedule_id = ?
    ORDER BY executed_at DESC
    LIMIT ?
  `);
  return stmt.all(scheduleId, limit) as ScheduleLog[];
}

// 更新排程啟用狀態
export function setScheduleEnabled(id: number, enabled: boolean): boolean {
  const db = getDb();
  const stmt = db.prepare("UPDATE schedules SET enabled = ? WHERE id = ?");
  const result = stmt.run(enabled ? 1 : 0, id);
  return result.changes > 0;
}

// 取得待執行的排程
function getDueSchedules(): Schedule[] {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    SELECT * FROM schedules
    WHERE enabled = 1
      AND next_run IS NOT NULL
      AND next_run <= ?
  `);

  return stmt.all(now) as Schedule[];
}

// 更新排程執行狀態
function updateScheduleAfterRun(schedule: Schedule): void {
  const db = getDb();
  const now = new Date().toISOString();

  if (schedule.cron_expression) {
    // 重複排程：計算下次執行時間
    const nextRun = calculateNextRun(schedule.cron_expression);
    const stmt = db.prepare(`
      UPDATE schedules SET last_run = ?, next_run = ? WHERE id = ?
    `);
    stmt.run(now, nextRun?.toISOString() || null, schedule.id);
  } else {
    // 一次性排程：停用
    const stmt = db.prepare(`
      UPDATE schedules SET last_run = ?, enabled = 0, next_run = NULL WHERE id = ?
    `);
    stmt.run(now, schedule.id);
  }
}

// 執行排程檢查
async function checkAndRunSchedules(): Promise<void> {
  if (!taskExecutor) {
    logger.warn("No task executor set, skipping schedule check");
    return;
  }

  const dueSchedules = getDueSchedules();

  for (const schedule of dueSchedules) {
    try {
      logger.info({ scheduleId: schedule.id, name: schedule.name }, "Executing schedule");
      const result = await taskExecutor(schedule);

      // 記錄執行結果
      if (result.success) {
        logScheduleExecution(schedule.id, "success", result.result);
        logger.info({ scheduleId: schedule.id }, "Schedule executed successfully");
      } else {
        logScheduleExecution(schedule.id, "error", undefined, result.error);
        logger.error({ scheduleId: schedule.id, error: result.error }, "Schedule execution failed");
      }

      updateScheduleAfterRun(schedule);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ error, scheduleId: schedule.id }, "Failed to execute schedule");
      logScheduleExecution(schedule.id, "error", undefined, errorMessage);
      // 仍然更新執行時間，避免無限重試
      updateScheduleAfterRun(schedule);
    }
  }
}

// 啟動排程器
export function startScheduler(executor: TaskExecutor): void {
  if (intervalId) {
    logger.warn("Scheduler already running");
    return;
  }

  taskExecutor = executor;

  // 立即執行一次檢查
  checkAndRunSchedules();

  // 每分鐘檢查
  intervalId = setInterval(checkAndRunSchedules, CHECK_INTERVAL_MS);
  logger.info("Scheduler started");
}

// 停止排程器
export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    taskExecutor = null;
    logger.info("Scheduler stopped");
  }
}
