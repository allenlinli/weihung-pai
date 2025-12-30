#!/bin/bash
# SSH 到 VPS 的快捷腳本
# 用法: ./scripts/ssh-to-vps.sh [command]
# 範例:
#   ./scripts/ssh-to-vps.sh                    # 互動式登入
#   ./scripts/ssh-to-vps.sh "ls -la"           # 執行單一指令

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"
KEY_FILE="/tmp/.pai_ssh_key_$$"

cleanup() {
    rm -f "$KEY_FILE" 2>/dev/null
}
trap cleanup EXIT

cd "$ANSIBLE_DIR"

# 從 vault 取得 SSH key
ansible-vault decrypt inventory/group_vars/all/vault.yml --output=- 2>/dev/null | \
    awk '/pai_agent_ssh_private_key:/,/pai_agent_ssh_public_key:/' | \
    grep -v 'pai_agent_ssh' | \
    sed 's/^  //' > "$KEY_FILE"
chmod 600 "$KEY_FILE"

# 從 vault 取得 server IP
SERVER_IP=$(ansible-vault decrypt inventory/group_vars/all/vault.yml --output=- 2>/dev/null | \
    grep 'vault_server_ip:' | sed 's/.*"\(.*\)".*/\1/')

if [ -n "$1" ]; then
    # 執行指定指令
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "pai@$SERVER_IP" "$1"
else
    # 互動式登入
    echo "連線到 pai@$SERVER_IP ..."
    echo "提示: 執行 ~/.local/bin/claude setup-token 設定認證"
    echo ""
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "pai@$SERVER_IP"
fi
