# setup

互動式設定精靈，用於初始化 PAI Infrastructure。

## 功能

- 設定 Ansible Vault 密碼
- 收集必要與可選變數
- 建立加密的 vault.yml
- 執行初始化 Playbooks

## 使用

```bash
uv run pai-setup
```

精靈會引導完成以下步驟：

1. **Vault 密碼** - 設定或驗證 vault 密碼
2. **必要變數** - VPS 主機、用戶、API keys
3. **可選變數** - Google OAuth、Spotify 等
4. **Vault 檔案** - 建立加密的 vault.yml
5. **Playbooks** - 執行初始化部署

## 目錄結構

```
setup/
├── __main__.py        # 入口點
├── config.py          # 配置定義
├── state.py           # 進度狀態管理
├── ui.py              # 終端 UI 工具
├── steps/             # 各步驟實作
│   ├── vault.py       # Vault 密碼設定
│   ├── variables.py   # 變數收集
│   └── playbooks.py   # Playbook 執行
├── utils/             # 工具函式
│   ├── yaml.py        # YAML 處理
│   ├── command.py     # 指令執行
│   └── ssh.py         # SSH 工具
└── tests/             # 單元測試
```

## 進度保存

設定過程可隨時中斷（Ctrl+C），進度會自動保存。再次執行 `uv run pai-setup` 可繼續。
