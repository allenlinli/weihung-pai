# 知識庫管理 Skill

## 概述

Wei-Hung 的個人知識庫位於 `~/obsidian-vault/`，使用 Obsidian 格式（Markdown）。這是他累積的學習筆記、研究文獻、專案紀錄等重要資產。

**雙向同步**：知識庫透過 LiveSync Bridge 與 CouchDB 即時同步，任何修改都會自動同步到所有裝置（桌面、手機、VPS）。

## 何時使用

### 查詢知識庫
- 用戶詢問學習內容、過去的筆記、研究資料時
- 用戶問「我之前有沒有...」、「我的筆記裡...」等問題
- 需要參考過去記錄來回答問題時

**使用 MCP 工具**：`obsidian_agent_query` 或 `obsidian_search`

### 寫入知識庫
當以下情況發生時，**主動將內容整理成筆記**（不需確認）：
- 協助用戶理解新概念或學習新知識
- 完成研究或深度分析
- 討論重要的技術決策或架構
- 用戶說「幫我記下來」、「這個很重要」

**直接寫入 Inbox**：新筆記放到 `~/obsidian-vault/Inbox/`，會自動同步到用戶的所有裝置

**需要確認的情況**：
- 要整合/重構現有筆記時
- 要移動或刪除筆記時

## 知識庫結構

```
~/obsidian-vault/
├── Inbox/              # 【主要寫入位置】新筆記暫存區
├── Projects/           # 專案相關筆記
│   ├── Philosophy/     # 哲學研究
│   │   └── LLM and grounding/  # LLM 與 grounding 研究
│   └── {其他專案}/
├── Literature/         # 文獻筆記
│   └── {主題}/
├── Templates/          # 筆記模板
└── copilot-conversations/  # AI 對話記錄
```

## 筆記格式規範

### 新建筆記時
1. 使用 Markdown 格式
2. 開頭加上 YAML frontmatter：
```yaml
---
created: YYYY-MM-DD
tags: [tag1, tag2]
source: merlin
---
```
3. 使用清晰的標題層級
4. 適當使用 wiki-link: `[[相關筆記]]`

### 檔名規範
- 使用有意義的名稱：`主題-關鍵字.md`
- 範例：`LLM-grounding-概念整理.md`、`React-hooks-學習筆記.md`

## 範例流程

### 協助用戶學習後（主動寫入）
```
1. 整理學習內容成筆記格式
2. 直接寫入 ~/obsidian-vault/Inbox/{適當檔名}.md
3. 告知用戶：「已將筆記存到 Inbox，會自動同步到你的裝置」
```

### 用戶要求查詢過去筆記
```
1. 使用 obsidian_agent_query 搜尋
2. 整合搜尋結果回答
3. 如果需要完整內容，用 Read 工具讀取特定檔案
```

### 建議整合現有筆記（需確認）
```
1. 搜尋發現相關筆記分散各處
2. 向用戶說明：「發現 X 個相關筆記，建議整合到 Y 位置，要進行嗎？」
3. 用戶同意後才執行整合
```

## 注意事項

- 新筆記直接寫入 `Inbox/`，不需確認
- 修改/整合現有筆記前**要確認**
- 筆記語言跟隨用戶習慣（通常繁體中文）
- 加上 `source: merlin` tag 標記來源
