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

show_help() {
    echo "Mutagen 同步工具"
    echo ""
    echo "用法: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start   啟動同步"
    echo "  stop    停止同步"
    echo "  status  查看狀態"
    echo "  flush   強制同步"
    echo "  reset   重置 session"
    echo "  help    顯示此說明"
    echo ""
    echo "無參數時進入互動模式"
}

do_start() {
    echo "啟動 mutagen daemon..."
    mutagen daemon start 2>/dev/null || true
    echo "啟動同步..."
    mutagen project start
    echo ""
    mutagen sync list
}

do_stop() {
    echo "停止同步..."
    mutagen project terminate
}

do_status() {
    mutagen sync list
}

do_flush() {
    echo "強制同步..."
    mutagen sync flush pai-claude
    sleep 2
    mutagen sync list
}

do_reset() {
    echo "重置同步 session..."
    mutagen project terminate 2>/dev/null || true
    mutagen project start
}

interactive_menu() {
    echo "╭─────────────────────────────╮"
    echo "│   Mutagen 同步工具         │"
    echo "╰─────────────────────────────╯"
    echo ""
    PS3=$'\n請選擇操作: '
    options=("啟動同步" "停止同步" "查看狀態" "強制同步" "重置 session" "離開")
    select opt in "${options[@]}"; do
        case $REPLY in
            1) do_start; break ;;
            2) do_stop; break ;;
            3) do_status; break ;;
            4) do_flush; break ;;
            5) do_reset; break ;;
            6) echo "Bye!"; exit 0 ;;
            *) echo "無效選項，請輸入 1-6" ;;
        esac
    done
}

case "${1:-}" in
    start)  do_start ;;
    stop)   do_stop ;;
    status) do_status ;;
    flush)  do_flush ;;
    reset)  do_reset ;;
    help|-h|--help)
        show_help
        ;;
    "")
        interactive_menu
        ;;
    *)
        echo "未知指令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
