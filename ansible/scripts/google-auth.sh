#!/bin/bash
# Google OAuth2 授權腳本
# 用法: ./scripts/google-auth.sh
# 執行一次，取得 refresh token 後自動存入 vault

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ANSIBLE_DIR"

echo "=== Google OAuth2 授權 ==="
echo ""

# 從 vault 或環境變數取得 credentials
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "從 vault 讀取 credentials..."
    VAULT_CONTENT=$(ansible-vault decrypt inventory/group_vars/all/vault.yml --output=- 2>/dev/null) || {
        echo "錯誤：無法讀取 vault"
        echo "請先執行 playbook 設定 credentials："
        echo "  export GOOGLE_CLIENT_ID='your-client-id'"
        echo "  export GOOGLE_CLIENT_SECRET='your-client-secret'"
        echo "  ./scripts/ansible-wrapper.sh ansible-playbook playbooks/config/google-oauth.yml"
        exit 1
    }

    GOOGLE_CLIENT_ID=$(echo "$VAULT_CONTENT" | grep 'vault_google_client_id:' | sed 's/.*"\(.*\)".*/\1/')
    GOOGLE_CLIENT_SECRET=$(echo "$VAULT_CONTENT" | grep 'vault_google_client_secret:' | sed 's/.*"\(.*\)".*/\1/')
fi

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "錯誤：vault 中缺少 Google OAuth2 credentials"
    echo "請先執行："
    echo "  export GOOGLE_CLIENT_ID='your-client-id'"
    echo "  export GOOGLE_CLIENT_SECRET='your-client-secret'"
    echo "  ./scripts/ansible-wrapper.sh ansible-playbook playbooks/config/google-oauth.yml"
    exit 1
fi

echo "Client ID: ${GOOGLE_CLIENT_ID:0:20}..."

# OAuth2 設定
SCOPES="https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/contacts"
REDIRECT_URI="http://localhost:8085"

# 產生授權 URL
AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES// /%20}&access_type=offline&prompt=consent"

echo "請在瀏覽器中開啟以下網址進行授權："
echo ""
echo "$AUTH_URL"
echo ""

# 嘗試自動開啟瀏覽器
if command -v open &> /dev/null; then
    open "$AUTH_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$AUTH_URL"
fi

# 啟動本機伺服器等待 callback
echo "等待授權回調..."
RESPONSE=$(bun "$SCRIPT_DIR/google-auth-server.js" 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    echo "錯誤：未收到授權回調"
    exit 1
fi

# 解析 authorization code
AUTH_CODE=$(echo "$RESPONSE" | grep -o 'code=[^&]*' | cut -d= -f2)

if [ -z "$AUTH_CODE" ]; then
    echo "錯誤：未取得 authorization code"
    exit 1
fi

echo "取得 authorization code，交換 tokens..."

# 交換 tokens
TOKEN_RESPONSE=$(curl -s -X POST "https://oauth2.googleapis.com/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${GOOGLE_CLIENT_ID}" \
    -d "client_secret=${GOOGLE_CLIENT_SECRET}" \
    -d "code=${AUTH_CODE}" \
    -d "grant_type=authorization_code" \
    -d "redirect_uri=${REDIRECT_URI}")

# 用 jq 或 sed 解析 JSON（處理特殊字元）
if command -v jq &> /dev/null; then
    REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token // empty')
else
    REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | sed -n 's/.*"refresh_token": *"\([^"]*\)".*/\1/p')
fi

if [ -z "$REFRESH_TOKEN" ]; then
    echo "錯誤：未取得 refresh token"
    echo "回應：$TOKEN_RESPONSE"
    exit 1
fi

echo ""
echo "=== 成功取得 Refresh Token ==="
echo ""

# 直接更新 vault
echo "更新 vault..."
cd "$ANSIBLE_DIR"

VAULT_FILE="inventory/group_vars/all/vault.yml"
TMP_FILE="/tmp/vault_decrypted_$$"

ansible-vault decrypt "$VAULT_FILE" --output="$TMP_FILE"

# 更新或新增 refresh token
if grep -q "vault_google_refresh_token:" "$TMP_FILE"; then
    sed -i '' "s|vault_google_refresh_token:.*|vault_google_refresh_token: \"${REFRESH_TOKEN}\"|" "$TMP_FILE"
else
    echo "vault_google_refresh_token: \"${REFRESH_TOKEN}\"" >> "$TMP_FILE"
fi

ansible-vault encrypt "$TMP_FILE" --output="$VAULT_FILE"
rm -f "$TMP_FILE"

echo ""
echo "✓ Refresh token 已存入 vault"
