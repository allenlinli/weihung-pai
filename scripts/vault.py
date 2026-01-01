"""Vault 解密工具"""

import subprocess
from pathlib import Path
from typing import Any

import yaml

ROOT_DIR = Path(__file__).parent.parent
VAULT_FILE = ROOT_DIR / "ansible" / "inventory" / "group_vars" / "all" / "vault.yml"
VAULT_PASSWORD_FILE = Path.home() / ".vault_pass_pai"


def decrypt_vault() -> dict[str, Any]:
    """解密 vault.yml 並返回內容"""
    if not VAULT_FILE.exists():
        raise FileNotFoundError(f"Vault 檔案不存在: {VAULT_FILE}")

    if not VAULT_PASSWORD_FILE.exists():
        raise FileNotFoundError(
            f"Vault 密碼檔案不存在: {VAULT_PASSWORD_FILE}\n" "請先執行: uv run python -m setup"
        )

    result = subprocess.run(
        [
            "ansible-vault",
            "decrypt",
            str(VAULT_FILE),
            "--vault-password-file",
            str(VAULT_PASSWORD_FILE),
            "--output=-",
        ],
        capture_output=True,
        text=True,
        cwd=ROOT_DIR,
    )

    if result.returncode != 0:
        raise RuntimeError(f"Vault 解密失敗: {result.stderr}")

    data: dict[str, Any] = yaml.safe_load(result.stdout)
    return data


def get_vault_value(key: str) -> str | None:
    """取得 vault 中的特定值"""
    vault = decrypt_vault()
    return vault.get(key)


def extract_ssh_private_key(vault: dict[str, Any]) -> str:
    """從 vault 中提取 SSH 私鑰"""
    key: str = vault.get("pai_agent_ssh_private_key", "")
    if not key:
        raise ValueError("vault 中缺少 pai_agent_ssh_private_key")
    return key
