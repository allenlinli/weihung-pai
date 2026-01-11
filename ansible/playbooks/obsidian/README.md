# Obsidian LiveSync 部署指南

## 架構概覽

```
本地 Obsidian ←→ CouchDB (VPS) ←→ LiveSync Bridge ←→ VPS 檔案系統
                                                          ↓
                                                    RAG 語意搜尋
```

## VPS 部署

```bash
uv run pai ansible ansible-playbook ansible/playbooks/deploy-obsidian.yml
```

這會依序部署：
1. **CouchDB** - 同步資料庫
2. **LiveSync Bridge** - 將 CouchDB 同步到 VPS 檔案系統
3. **RAG** - 語意搜尋索引

## 本地端 Obsidian 設定

### 1. 安裝插件

在 Obsidian 中安裝 **Self-hosted LiveSync** 插件。

### 2. 設定連線

打開 LiveSync 設定，配置以下項目：

#### Remote Configuration
| 設定 | 值 |
|------|-----|
| Remote URI | `https://obsync.wayneh.tw/obsidian` |
| Username | `weihung` |
| Password | （見 vault.yml） |

#### Encryption（重要！）

| 設定 | 值 |
|------|-----|
| End-to-End Encryption | ✅ 啟用 |
| Passphrase | （與 Password 相同） |
| **Path Obfuscation** | ✅ 啟用 |
| **Property Encryption** | ✅ 啟用 |

> **注意**：Path Obfuscation 和 Property Encryption 必須啟用，否則與 LiveSync Bridge 不兼容。
>
> LiveSync Bridge 的 `obfuscatePassphrase` 設定必須與本地 Passphrase 一致。

#### Sync Settings
| 設定 | 建議值 |
|------|--------|
| Sync Mode | LiveSync |
| Fetch on Start | ✅ |

### 3. 首次同步

1. 點擊 **Check** 確認連線正常
2. 選擇 **Fetch from Remote**（從遠端拉取）或 **Rebuild Everything**

## 故障排除

### 本地看不到 VPS 新增的檔案

**原因**：加密設定不一致

**解決方案**：
1. 確認本地 Obsidian 的 Path Obfuscation 和 Property Encryption 都有啟用
2. 確認 Passphrase 與 VPS 上的 `obfuscatePassphrase` 一致
3. 執行 `Rebuild Everything` → `Fetch from Remote`

### 檢查 LiveSync Bridge 狀態

```bash
# 查看服務狀態
uv run pai ssh connect "systemctl status livesync-bridge"

# 查看日誌
uv run pai ssh connect "journalctl -u livesync-bridge -f"

# 重啟服務
uv run pai ssh connect "sudo systemctl restart livesync-bridge"
```

### 檢查 CouchDB 狀態

```bash
# 查看文檔數量
uv run pai ssh connect "curl -s -u weihung:PASSWORD http://localhost:5984/obsidian | jq .doc_count"
```

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `01-couchdb.yml` | CouchDB Docker 部署 |
| `02-livesync-bridge.yml` | LiveSync Bridge 部署 |
| `03-rag.yml` | RAG 語意搜尋設定 |
| `templates/livesync-bridge.config.json.j2` | Bridge 配置模板 |
