#!/usr/bin/env bun

/**
 * Session Stop Hook
 *
 * 功能：
 * 1. 分析 Claude 回應內容
 * 2. 自動分類（session / learning / decision）
 * 3. 保存到對應的 history 目錄
 *
 * 參考：PAI (Personal AI Infrastructure) 的 Stop Hook 設計
 * - 自動捕捉工作脈絡，零手動成本
 * - 基於關鍵字分析自動分類
 */

import { classifyResponse, saveToHistory, extractSummary } from "./lib/history";

interface StopEvent {
  stop_response?: string;
  session_id?: string;
}

async function main() {
  // 從 stdin 讀取事件資料
  const input = await Bun.stdin.text();
  if (!input.trim()) return;

  let data: StopEvent;
  try {
    data = JSON.parse(input);
  } catch {
    // 無法解析 JSON
    return;
  }

  const response = data.stop_response;
  if (!response || response.length < 100) {
    // 回應太短，不值得保存
    return;
  }

  // 分析回應類型
  const { type, confidence } = classifyResponse(response);

  // 只保存有意義的內容（confidence >= 0.5 或類型不是 sessions）
  if (type === "sessions" && confidence < 0.5) {
    return;
  }

  // 提取摘要
  const summary = extractSummary(response, 1000);

  // 保存到 history
  try {
    const filePath = await saveToHistory(type, summary, {
      session_id: data.session_id || "unknown",
      confidence: String(confidence.toFixed(2)),
    });

    console.log(`[History] Saved ${type}: ${filePath.split("/").pop()}`);
  } catch (error) {
    console.error(`[History] Failed to save: ${error}`);
  }
}

main().catch(console.error);
