#!/bin/bash
# 從 vault 提取 SSH 設定並更新 ~/.ssh/config
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"
SSH_KEY_FILE="$HOME/.ssh/pai-agent"
SSH_CONFIG="$HOME/.ssh/config"

cd "$ANSIBLE_DIR"

echo "從 vault 解密設定..."

# 解密 vault 取得完整內容
VAULT_CONTENT=$(ansible-vault decrypt inventory/group_vars/all/vault.yml --output=- 2>/dev/null)

# 提取 IP
SERVER_IP=$(echo "$VAULT_CONTENT" | grep "vault_server_ip:" | cut -d'"' -f2)

# 提取 SSH key
echo "$VAULT_CONTENT" | grep -A50 "pai_agent_ssh_private_key:" | tail -n +2 | sed '/^[a-z]/q' | sed '$d' | sed 's/^  //' > "$SSH_KEY_FILE"
chmod 600 "$SSH_KEY_FILE"

echo "SSH key 已儲存到 $SSH_KEY_FILE"

# 更新 SSH config
if grep -q "^Host pai-server" "$SSH_CONFIG" 2>/dev/null; then
    echo "pai-server 已存在於 SSH config，跳過..."
else
    echo "" >> "$SSH_CONFIG"
    cat >> "$SSH_CONFIG" << EOF
Host pai-server
    HostName $SERVER_IP
    User pai
    IdentityFile $SSH_KEY_FILE
EOF
    echo "已更新 $SSH_CONFIG"
fi

echo ""
echo "設定完成！測試連線："
echo "  ssh pai-server"
echo ""
echo "啟動 mutagen 同步："
echo "  cd $(dirname "$ANSIBLE_DIR") && mutagen project start"
