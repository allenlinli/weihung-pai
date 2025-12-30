---
name: dev
description: 啟動開發環境
arguments:
  - name: service
    description: 要啟動的服務 (bot, mcp, all)
    required: false
---

# 啟動開發環境

啟動 PAI 專案的開發伺服器。

## 流程

### 啟動 Bot

```bash
cd pai-bot && bun run dev
```

### 啟動 MCP Server

```bash
cd pai-mcp && bun run dev
```

### 同時啟動

在不同終端分別執行上述指令，或使用：

```bash
cd pai-bot && bun run dev &
cd pai-mcp && bun run dev &
```

## 範例

```
/dev bot    # 只啟動 Bot
/dev mcp    # 只啟動 MCP
/dev all    # 同時啟動
/dev        # 預設啟動 Bot
```
