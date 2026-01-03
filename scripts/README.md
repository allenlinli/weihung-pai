# scripts

PAI Infrastructure CLI 工具集。

## 使用

```bash
uv run pai <command> [args...]
```

## 命令

### ansible

執行 Ansible 命令，自動從 vault 解密 SSH key。

```bash
uv run pai ansible ansible-playbook ansible/playbooks/deploy-bot.yml
uv run pai ansible ansible-inventory --list
```

### ssh

SSH 連線管理。

```bash
uv run pai ssh connect          # 互動式登入
uv run pai ssh connect "ls -la" # 執行遠端命令
uv run pai ssh setup            # 設定 ~/.ssh/config
```

### bot

VPS 上的 Bot 管理。

```bash
uv run pai bot status           # 查看狀態
uv run pai bot logs             # 查看日誌（預設 50 行）
uv run pai bot logs -n 100      # 查看 100 行
uv run pai bot logs -f          # 持續追蹤
uv run pai bot logs -e          # 錯誤日誌
uv run pai bot restart          # 重啟
```

### google

Google OAuth2 認證。

```bash
uv run pai google auth          # 執行授權流程
uv run pai google token         # 取得 access token
```

### discord

Discord Bot 管理。

```bash
uv run pai discord invite       # 生成邀請連結
```

### spotify

Spotify 認證（Librespot）。

```bash
uv run pai spotify auth         # 執行認證
uv run pai spotify test         # 測試認證狀態
uv run pai spotify token        # 取得 token
```

## 目錄結構

```
scripts/
├── __main__.py        # CLI 入口點
├── ansible.py         # Ansible wrapper
├── ssh.py             # SSH 工具
├── bot.py             # Bot 管理
├── google.py          # Google OAuth
├── discord.py         # Discord 工具
├── vault.py           # Vault 解密
└── upload_cookies.py  # YouTube cookies
```
