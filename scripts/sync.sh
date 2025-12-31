#!/bin/bash
# Mutagen 同步 wrapper
# 確保在正確目錄執行，並處理常見操作

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 檢查 mutagen 是否安裝
if ! command -v mutagen &> /dev/null; then
    echo "錯誤: mutagen 未安裝"
    echo "請執行: brew install mutagen-io/mutagen/mutagen"
    exit 1
fi

# 檢查 SSH config 是否設定
if ! grep -q "^Host pai-server" ~/.ssh/config 2>/dev/null; then
    echo "錯誤: SSH config 未設定 pai-server"
    echo "請先執行: cd ansible && ./scripts/setup-ssh-config.sh"
    exit 1
fi

case "${1:-status}" in
    start)
        echo "啟動 mutagen daemon..."
        mutagen daemon start 2>/dev/null || true
        echo "啟動同步..."
        mutagen project start
        echo ""
        mutagen sync list
        ;;
    stop)
        echo "停止同步..."
        mutagen project terminate
        ;;
    status)
        mutagen sync list
        ;;
    flush)
        echo "強制同步..."
        mutagen sync flush pai-claude
        sleep 2
        mutagen sync list
        ;;
    reset)
        echo "重置同步 session..."
        mutagen project terminate 2>/dev/null || true
        mutagen project start
        ;;
    *)
        echo "用法: $0 {start|stop|status|flush|reset}"
        echo ""
        echo "  start  - 啟動同步"
        echo "  stop   - 停止同步"
        echo "  status - 查看狀態"
        echo "  flush  - 強制同步"
        echo "  reset  - 重置 session"
        exit 1
        ;;
esac
