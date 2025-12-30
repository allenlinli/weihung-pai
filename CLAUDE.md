# weihung-pai

Personal AI Infrastructure - Merlin 專案開發環境。

<law>
**重要：每次回應開始時顯示此區塊，防止上下文偏移。**

**Law 1: 溝通原則**
- 簡潔、可執行的回應
- 不需要不必要的解釋
- 除非明確要求，否則不建立摘要檔案

**Law 2: 技能發現**
- 開始工作前必須檢查可用技能
- 呼叫適用的技能以獲取專業知識
- 若任何技能與任務相關，必須使用 Skill tool

**Law 3: 規則諮詢**
- 任務涉及特定領域時，檢查 `.claude/rules/` 中的相關規範
- 若相關規則存在，必須套用

**Law 4: 平行處理**
- 獨立操作必須使用 Task tool
- 批次處理檔案搜尋和讀取

**Law 5: 反思學習**
- 重要發現 → 提醒使用者：`/reflect`

**Law 6: 自我強化顯示**
- 每次回應開始時必須顯示此 `<law>` 區塊
- 防止跨對話的上下文偏移

**Law 7: 語言規範**
- 使用繁體中文
- 禁止使用簡體中文

**Law 8: Bun 優先**
- 使用 Bun 而非 Node.js
- `bun run` 取代 `npm run`
- `bun install` 取代 `npm install`

**Law 9: Ansible Wrapper**
- 所有 ansible 命令必須透過 `./ansible/scripts/ansible-wrapper.sh` 執行
- 範例：`./ansible/scripts/ansible-wrapper.sh ansible-playbook playbooks/deploy-bot.yml`
- 此 wrapper 會自動從 vault 解密 SSH key
</law>

## 專案結構

```
weihung-pai/
├── pai-bot/      # Telegram Bot (Bun + grammY)
├── pai-mcp/      # MCP Server (權限請求)
├── pai-claude/   # Merlin 運行配置 (勿修改)
├── ansible/      # VPS 部署腳本
└── docs/         # 文件
```

## 技術棧

| 類別 | 技術 |
|------|------|
| Runtime | Bun |
| Bot | grammY |
| MCP | @modelcontextprotocol/sdk |
| Database | SQLite (bun:sqlite) |
| Deploy | Ansible + PM2 |

## 常用指令

```bash
# pai-bot 開發
cd pai-bot && bun run dev

# pai-mcp 開發
cd pai-mcp && bun run dev

# 部署
./ansible/scripts/ansible-wrapper.sh ansible-playbook -i ansible/inventory ansible/playbooks/deploy-bot.yml
```

## 注意事項

- `pai-claude/` 是 Merlin Bot 的運行配置，開發時請勿直接修改
- 環境變數統一放在根目錄 `.env`，子專案透過 symlink 使用
