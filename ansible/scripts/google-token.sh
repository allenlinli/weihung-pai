#!/bin/bash
# 從 vault 取得 Google access token
# 用法: ./scripts/google-token.sh
# 輸出 access token 到 stdout

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ANSIBLE_DIR"

# 從 vault 解密取得 credentials
VAULT_CONTENT=$(ansible-vault decrypt inventory/group_vars/all/vault.yml --output=- 2>/dev/null)

CLIENT_ID=$(echo "$VAULT_CONTENT" | grep 'vault_google_client_id:' | sed 's/.*"\(.*\)".*/\1/')
CLIENT_SECRET=$(echo "$VAULT_CONTENT" | grep 'vault_google_client_secret:' | sed 's/.*"\(.*\)".*/\1/')
REFRESH_TOKEN=$(echo "$VAULT_CONTENT" | grep 'vault_google_refresh_token:' | sed 's/.*"\(.*\)".*/\1/')

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ] || [ -z "$REFRESH_TOKEN" ]; then
    echo "錯誤：vault 中缺少 Google OAuth2 設定" >&2
    echo "請先執行 ./scripts/google-auth.sh 進行授權" >&2
    exit 1
fi

# 用 refresh token 換取 access token
TOKEN_RESPONSE=$(curl -s -X POST "https://oauth2.googleapis.com/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "refresh_token=${REFRESH_TOKEN}" \
    -d "grant_type=refresh_token")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "錯誤：無法取得 access token" >&2
    echo "回應：$TOKEN_RESPONSE" >&2
    exit 1
fi

echo "$ACCESS_TOKEN"
