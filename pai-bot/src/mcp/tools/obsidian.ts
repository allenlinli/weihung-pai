import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { $ } from "bun";
import { homedir } from "os";
import { join } from "path";

const VENV_PYTHON = join(homedir(), ".venv/bin/python");
const RAG_SCRIPT = join(homedir(), "merlin/scripts/obsidian_rag.py");
const VAULT_PATH = join(homedir(), "obsidian");

export function registerObsidianTools(server: McpServer): void {
  server.registerTool(
    "obsidian_search",
    {
      title: "Search Obsidian Notes",
      description: "在 Obsidian 知識庫中進行語意搜尋",
      inputSchema: {
        query: z.string().describe("搜尋查詢（自然語言）"),
        top_k: z.number().optional().describe("返回結果數量（預設 5）"),
      },
    },
    async ({ query, top_k = 5 }) => {
      try {
        const result = await $`${VENV_PYTHON} ${RAG_SCRIPT} search --vault ${VAULT_PATH} -q ${query} -k ${top_k}`.quiet();
        const output = result.stdout.toString();

        if (!output.trim()) {
          return { content: [{ type: "text", text: `沒有找到與「${query}」相關的筆記` }] };
        }

        return { content: [{ type: "text", text: output }] };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `搜尋失敗: ${errorMsg}` }] };
      }
    }
  );

  server.registerTool(
    "obsidian_stats",
    {
      title: "Obsidian Stats",
      description: "查看 Obsidian RAG 索引統計",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await $`${VENV_PYTHON} ${RAG_SCRIPT} stats --vault ${VAULT_PATH}`.quiet();
        return { content: [{ type: "text", text: result.stdout.toString() }] };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `統計失敗: ${errorMsg}` }] };
      }
    }
  );

  server.registerTool(
    "obsidian_sync",
    {
      title: "Sync Obsidian Index",
      description: "同步 Obsidian RAG 索引（更新有變更的檔案）",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await $`${VENV_PYTHON} ${RAG_SCRIPT} sync --vault ${VAULT_PATH}`.quiet();
        return { content: [{ type: "text", text: result.stdout.toString() }] };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `同步失敗: ${errorMsg}` }] };
      }
    }
  );
}
