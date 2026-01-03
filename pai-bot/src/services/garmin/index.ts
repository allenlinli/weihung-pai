// Garmin Connect 服務

import { $ } from "bun";
import { join } from "path";
import type {
  GarminStats,
  GarminSleep,
  GarminActivity,
  GarminHeartRate,
  GarminHealthSummary,
} from "./types";

const SYNC_SCRIPT = join(import.meta.dir, "sync.py");

// 環境變數
const GARMIN_EMAIL = process.env.GARMIN_EMAIL;
const GARMIN_PASSWORD = process.env.GARMIN_PASSWORD;

export function isGarminConfigured(): boolean {
  return !!(GARMIN_EMAIL && GARMIN_PASSWORD);
}

async function runSync<T>(command: string, args: string[] = []): Promise<T> {
  if (!isGarminConfigured()) {
    throw new Error("Garmin credentials not configured");
  }

  const allArgs = [GARMIN_EMAIL!, GARMIN_PASSWORD!, command, ...args];

  try {
    const result =
      await $`uv run --with garminconnect python3 ${SYNC_SCRIPT} ${allArgs}`.text();
    const parsed = JSON.parse(result.trim());

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    return parsed as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Garmin sync failed: ${error}`);
  }
}

/**
 * 取得每日統計數據
 */
export async function getStats(date?: string): Promise<GarminStats> {
  return runSync<GarminStats>("stats", date ? [date] : []);
}

/**
 * 取得睡眠數據
 */
export async function getSleep(date?: string): Promise<GarminSleep> {
  return runSync<GarminSleep>("sleep", date ? [date] : []);
}

/**
 * 取得最近活動
 */
export async function getActivities(limit = 10): Promise<GarminActivity[]> {
  return runSync<GarminActivity[]>("activities", [limit.toString()]);
}

/**
 * 取得心率數據
 */
export async function getHeartRates(date?: string): Promise<GarminHeartRate> {
  return runSync<GarminHeartRate>("heart", date ? [date] : []);
}

/**
 * 取得所有健康數據
 */
export async function getAll(
  date?: string
): Promise<{ stats: GarminStats; sleep: GarminSleep; activities: GarminActivity[] }> {
  return runSync("all", date ? [date] : []);
}

/**
 * 產生健康摘要（適合記憶保存）
 */
export async function getHealthSummary(date?: string): Promise<GarminHealthSummary> {
  const { stats, sleep } = await getAll(date);

  const sleepHours = (sleep.sleepTimeSeconds || 0) / 3600;
  const deepHours = (sleep.deepSleepSeconds || 0) / 3600;
  const remHours = (sleep.remSleepSeconds || 0) / 3600;

  // 睡眠品質評估
  let sleepQuality = "一般";
  const sleepScore = sleep.sleepScores?.overall || 0;
  if (sleepScore >= 80) sleepQuality = "優良";
  else if (sleepScore >= 60) sleepQuality = "良好";
  else if (sleepScore < 40) sleepQuality = "不佳";

  return {
    date: stats.date,
    steps: {
      current: stats.steps || 0,
      goal: stats.stepGoal || 10000,
      percentage: Math.round(((stats.steps || 0) / (stats.stepGoal || 10000)) * 100),
    },
    sleep: {
      totalHours: Math.round(sleepHours * 10) / 10,
      quality: sleepQuality,
      deepHours: Math.round(deepHours * 10) / 10,
      remHours: Math.round(remHours * 10) / 10,
    },
    heart: {
      resting: stats.restingHeartRate || 0,
      min: stats.minHeartRate || 0,
      max: stats.maxHeartRate || 0,
    },
    stress: {
      average: stats.averageStressLevel || 0,
      max: stats.maxStressLevel || 0,
    },
    bodyBattery: {
      highest: stats.bodyBatteryHighestValue || 0,
      lowest: stats.bodyBatteryLowestValue || 0,
      charged: stats.bodyBatteryChargedValue || 0,
      drained: stats.bodyBatteryDrainedValue || 0,
    },
  };
}

/**
 * 格式化健康摘要為可讀文字
 */
export function formatSummary(summary: GarminHealthSummary): string {
  const lines = [
    `📅 ${summary.date} 健康摘要`,
    "",
    `🚶 步數: ${summary.steps.current.toLocaleString()} / ${summary.steps.goal.toLocaleString()} (${summary.steps.percentage}%)`,
    `😴 睡眠: ${summary.sleep.totalHours}h (${summary.sleep.quality}) - 深睡 ${summary.sleep.deepHours}h / REM ${summary.sleep.remHours}h`,
    `❤️ 心率: 靜息 ${summary.heart.resting} / 最低 ${summary.heart.min} / 最高 ${summary.heart.max}`,
    `😰 壓力: 平均 ${summary.stress.average} / 最高 ${summary.stress.max}`,
    `🔋 Body Battery: ${summary.bodyBattery.lowest} → ${summary.bodyBattery.highest} (+${summary.bodyBattery.charged} / -${summary.bodyBattery.drained})`,
  ];

  return lines.join("\n");
}
