# Workspace 結構

所有工作檔案保存在 `./workspace/`：

| 目錄 | 用途 |
|------|------|
| `site/` | 網站檔案（Caddy serve） |
| `projects/` | Git repos 和專案 |
| `scripts/` | 一次性腳本 |
| `tools/` | 可重用工具程式 |
| `data/` | 資料檔案 |

- 腳本放 `scripts/`，可重用工具放 `tools/`
- 需要版本控制的專案放 `projects/`
