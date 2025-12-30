# weihung-pai

Personal AI Infrastructure - Merlin

基於 [Daniel Miessler PAI v2](https://danielmiessler.com/blog/personal-ai-infrastructure) 架構設計的個人化 Claude Code 數位助理系統。

## 專案結構

```
weihung-pai/
├── .claude/          # 開發環境 Claude Code 配置
│   ├── commands/     # Slash commands (deploy-bot, dev)
│   └── rules/        # 開發規範 (bun, commit, typescript)
├── pai-bot/          # Telegram Bot 服務 (Bun + grammY)
│   └── src/
│       ├── api/      # HTTP API server
│       ├── claude/   # Claude Code client
│       ├── platforms/# Telegram handlers
│       └── storage/  # SQLite 儲存
├── pai-claude/       # Merlin VPS 運行配置 (勿修改)
│   ├── agents/       # Subagents
│   ├── skills/       # 領域知識技能
│   └── scripts/      # 執行腳本
├── pai-mcp/          # MCP Server (權限請求)
├── ansible/          # VPS 部署
│   ├── playbooks/    # 部署劇本
│   ├── roles/        # Ansible roles
│   └── scripts/      # 包含 ansible-wrapper.sh
└── docs/             # 文件
```

## 功能

- **Telegram Bot** - 透過 Telegram 與 Merlin 對話
- **Skills 系統** - 模組化領域知識
- **Claude Slash Commands** - 透過 `/cc:` 前綴執行 Claude Code 指令
- **MCP 權限系統** - 危險操作需透過 Telegram 授權

## 快速開始

### 本地開發

```bash
# 安裝依賴
cd pai-bot && bun install
cd pai-mcp && bun install

# 設定環境變數
cp .env.example .env
# 編輯 .env

# 初始化資料庫
cd pai-bot && bun run db:init

# 啟動開發
cd pai-bot && bun run dev
```

### VPS 部署

```bash
# 設定 inventory
cd ansible
cp inventory/hosts.yml.example inventory/hosts.yml
cp inventory/group_vars/all/vault.yml.example inventory/group_vars/all/vault.yml
# 編輯以上檔案，並用 ansible-vault encrypt 加密 vault.yml

# 部署流程 (所有 ansible 命令透過 wrapper 執行)
# 1. 建立 VPS (可選，若已有 VPS 則跳過)
./scripts/ansible-wrapper.sh ansible-playbook playbooks/provision-vultr.yml

# 2. 初始化部署用戶
./scripts/ansible-wrapper.sh ansible-playbook playbooks/init-user.yml

# 3. VPS 基礎設定
./scripts/ansible-wrapper.sh ansible-playbook playbooks/setup-vps.yml

# 4. 設定 Claude 認證
./scripts/ansible-wrapper.sh ansible-playbook playbooks/setup-claude-auth.yml

# 5. 部署 Claude Code 配置
./scripts/ansible-wrapper.sh ansible-playbook playbooks/deploy-claude.yml

# 6. 部署 Bot
./scripts/ansible-wrapper.sh ansible-playbook playbooks/deploy-bot.yml
```

## Ansible Playbooks

| Playbook | 說明 |
|----------|------|
| `provision-vultr.yml` | 透過 Vultr API 建立 VPS |
| `init-user.yml` | 初始化部署用戶 |
| `setup-vps.yml` | VPS 基礎環境設定 |
| `setup-claude-auth.yml` | 設定 Claude 認證 |
| `deploy-claude.yml` | 部署 Claude Code 配置 |
| `deploy-bot.yml` | 部署 Telegram Bot |

## Bot 指令

| 指令 | 說明 |
|------|------|
| `/start` | 顯示歡迎訊息 |
| `/clear` | 清除對話歷史 |
| `/status` | 查看狀態 |
| `/cc:<cmd>` | 執行 Claude slash command |

## 技術棧

| 類別 | 技術 |
|------|------|
| Runtime | Bun |
| Bot | grammY |
| AI | Claude Code CLI (Headless) |
| MCP | @modelcontextprotocol/sdk |
| Database | SQLite (bun:sqlite) |
| Deploy | Ansible + PM2 |

## 參考

- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Daniel Miessler PAI v2](https://danielmiessler.com/blog/personal-ai-infrastructure)
