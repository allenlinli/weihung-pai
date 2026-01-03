import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as garmin from "../../services/garmin";

export function registerGarminTools(server: McpServer): void {
  server.registerTool(
    "garmin_stats",
    {
      title: "Garmin Daily Stats",
      description: "取得 Garmin 每日健康統計（步數、心率、壓力、Body Battery）",
      inputSchema: {
        date: z.string().optional().describe("日期 (YYYY-MM-DD)，預設今天"),
      },
    },
    async ({ date }) => {
      const stats = await garmin.getStats(date);
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    }
  );

  server.registerTool(
    "garmin_sleep",
    {
      title: "Garmin Sleep Data",
      description: "取得 Garmin 睡眠數據（睡眠時間、深睡、REM、睡眠分數）",
      inputSchema: {
        date: z.string().optional().describe("日期 (YYYY-MM-DD)，預設今天"),
      },
    },
    async ({ date }) => {
      const sleep = await garmin.getSleep(date);
      return {
        content: [{ type: "text", text: JSON.stringify(sleep, null, 2) }],
      };
    }
  );

  server.registerTool(
    "garmin_activities",
    {
      title: "Garmin Activities",
      description: "取得最近的運動活動紀錄",
      inputSchema: {
        limit: z.number().optional().describe("最多回傳幾筆，預設 10"),
      },
    },
    async ({ limit }) => {
      const activities = await garmin.getActivities(limit || 10);
      return {
        content: [{ type: "text", text: JSON.stringify(activities, null, 2) }],
      };
    }
  );

  server.registerTool(
    "garmin_heart",
    {
      title: "Garmin Heart Rate",
      description: "取得心率詳細數據",
      inputSchema: {
        date: z.string().optional().describe("日期 (YYYY-MM-DD)，預設今天"),
      },
    },
    async ({ date }) => {
      const hr = await garmin.getHeartRates(date);
      // 只回傳摘要，不回傳完整心率值（太多資料）
      const summary = {
        date: hr.date,
        restingHeartRate: hr.restingHeartRate,
        minHeartRate: hr.minHeartRate,
        maxHeartRate: hr.maxHeartRate,
        dataPoints: hr.heartRateValues?.length || 0,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      };
    }
  );

  server.registerTool(
    "garmin_summary",
    {
      title: "Garmin Health Summary",
      description: "取得健康摘要（適合記憶保存或每日回顧）",
      inputSchema: {
        date: z.string().optional().describe("日期 (YYYY-MM-DD)，預設今天"),
      },
    },
    async ({ date }) => {
      const summary = await garmin.getHealthSummary(date);
      const formatted = garmin.formatSummary(summary);
      return {
        content: [
          { type: "text", text: formatted },
          { type: "text", text: "\n\n---\nRaw data:\n" + JSON.stringify(summary, null, 2) },
        ],
      };
    }
  );
}
