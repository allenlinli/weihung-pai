import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as garmin from "../../services/garmin";

export function registerGarminTools(server: McpServer): void {
  server.registerTool(
    "garmin_stats",
    {
      title: "Garmin Daily Stats",
      description: "取得 Garmin 健康統計（步數、心率、壓力、Body Battery），支援日期範圍查詢",
      inputSchema: {
        startDate: z.string().optional().describe("開始日期 (YYYY-MM-DD)，預設今天"),
        endDate: z.string().optional().describe("結束日期 (YYYY-MM-DD)，預設同開始日期"),
      },
    },
    async ({ startDate, endDate }) => {
      const stats = await garmin.getStats(startDate, endDate);
      return {
        content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
      };
    },
  );

  server.registerTool(
    "garmin_sleep",
    {
      title: "Garmin Sleep Data",
      description: "取得 Garmin 睡眠數據（睡眠時間、深睡、REM、睡眠分數），支援日期範圍查詢",
      inputSchema: {
        startDate: z.string().optional().describe("開始日期 (YYYY-MM-DD)，預設今天"),
        endDate: z.string().optional().describe("結束日期 (YYYY-MM-DD)，預設同開始日期"),
      },
    },
    async ({ startDate, endDate }) => {
      const sleep = await garmin.getSleep(startDate, endDate);
      return {
        content: [{ type: "text", text: JSON.stringify(sleep, null, 2) }],
      };
    },
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
    },
  );

  server.registerTool(
    "garmin_heart",
    {
      title: "Garmin Heart Rate",
      description: "取得心率摘要數據，支援日期範圍查詢",
      inputSchema: {
        startDate: z.string().optional().describe("開始日期 (YYYY-MM-DD)，預設今天"),
        endDate: z.string().optional().describe("結束日期 (YYYY-MM-DD)，預設同開始日期"),
      },
    },
    async ({ startDate, endDate }) => {
      const hr = await garmin.getHeartRates(startDate, endDate);
      return {
        content: [{ type: "text", text: JSON.stringify(hr, null, 2) }],
      };
    },
  );

  server.registerTool(
    "garmin_summary",
    {
      title: "Garmin Health Summary",
      description: "取得健康摘要（適合記憶保存或每日回顧），支援日期範圍查詢",
      inputSchema: {
        startDate: z.string().optional().describe("開始日期 (YYYY-MM-DD)，預設今天"),
        endDate: z.string().optional().describe("結束日期 (YYYY-MM-DD)，預設同開始日期"),
      },
    },
    async ({ startDate, endDate }) => {
      const summaries = await garmin.getHealthSummary(startDate, endDate);
      const formatted = garmin.formatSummary(summaries);
      return {
        content: [
          { type: "text", text: formatted },
          {
            type: "text",
            text: `\n\n---\nRaw data:\n${JSON.stringify(summaries, null, 2)}`,
          },
        ],
      };
    },
  );
}
