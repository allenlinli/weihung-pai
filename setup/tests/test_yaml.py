"""測試 YAML 工具"""

from setup.utils.yaml import build_vault_yaml


class TestBuildVaultYaml:
    """build_vault_yaml 測試"""

    def test_empty_variables(self) -> None:
        """測試空變數"""
        result = build_vault_yaml({})
        assert "# Ansible Vault - 自動產生" in result
        assert "# 請勿手動編輯" in result

    def test_telegram_section(self) -> None:
        """測試 Telegram 區塊"""
        variables = {
            "telegram_bot_token": "123456:ABC",
            "telegram_allowed_user_ids": "12345",
        }
        result = build_vault_yaml(variables)

        assert "# === Telegram Bot ===" in result
        # 包含冒號會被引用
        assert 'telegram_bot_token: "123456:ABC"' in result
        assert "telegram_allowed_user_ids: 12345" in result

    def test_vps_section(self) -> None:
        """測試 VPS 區塊"""
        variables = {
            "vault_server_ip": "192.168.1.1",
            "pai_agent_user": "pai",
        }
        result = build_vault_yaml(variables)

        assert "# === VPS 設定 ===" in result
        assert "vault_server_ip: 192.168.1.1" in result
        assert "pai_agent_user: pai" in result

    def test_multiline_ssh_key(self) -> None:
        """測試多行 SSH Key"""
        ssh_key = """-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmU=
-----END OPENSSH PRIVATE KEY-----"""
        variables = {
            "pai_agent_ssh_private_key": ssh_key,
        }
        result = build_vault_yaml(variables)

        assert "pai_agent_ssh_private_key: |" in result
        assert "  -----BEGIN OPENSSH PRIVATE KEY-----" in result
        assert "  b3BlbnNzaC1rZXktdjEAAAAABG5vbmU=" in result

    def test_special_characters_escaped(self) -> None:
        """測試特殊字元跳脫"""
        variables = {
            "telegram_bot_token": 'token:with"quotes',
        }
        result = build_vault_yaml(variables)

        assert 'telegram_bot_token: "token:with\\"quotes"' in result

    def test_special_characters_colon(self) -> None:
        """測試包含冒號的值"""
        variables = {
            "telegram_bot_token": "123:456:789",
        }
        result = build_vault_yaml(variables)

        assert 'telegram_bot_token: "123:456:789"' in result

    def test_special_characters_hash(self) -> None:
        """測試包含井號的值"""
        variables = {
            "github_token": "ghp_abc#123",
        }
        result = build_vault_yaml(variables)

        assert 'github_token: "ghp_abc#123"' in result

    def test_skip_none_values(self) -> None:
        """測試跳過 None 值"""
        variables: dict[str, str | None] = {
            "vault_server_ip": "192.168.1.1",
            "vultr_api_key": None,
        }
        result = build_vault_yaml(variables)

        assert "vault_server_ip" in result
        assert "vultr_api_key" not in result

    def test_optional_sections_only_when_present(self) -> None:
        """測試可選區塊只在有值時出現"""
        variables = {
            "vault_server_ip": "192.168.1.1",
        }
        result = build_vault_yaml(variables)

        assert "# === VPS 設定 ===" in result
        assert "# === Vultr API（可選）===" not in result
        assert "# === Google OAuth（可選）===" not in result

    def test_multiple_sections(self) -> None:
        """測試多個區塊"""
        variables = {
            "telegram_bot_token": "token",
            "vault_server_ip": "1.2.3.4",
            "github_token": "ghp_xxx",
            "vultr_api_key": "vultr_key",
        }
        result = build_vault_yaml(variables)

        assert "# === Telegram Bot ===" in result
        assert "# === VPS 設定 ===" in result
        assert "# === GitHub ===" in result
        # 注意區塊名稱結尾有空格
        assert "# === Vultr API（可選） ===" in result

    def test_backslash_not_special(self) -> None:
        """測試反斜線不觸發引用（除非有其他特殊字元）"""
        variables = {
            "telegram_bot_token": "token_with_backslash",
        }
        result = build_vault_yaml(variables)
        # 無特殊字元時不會引用
        assert "telegram_bot_token: token_with_backslash" in result

    def test_backslash_with_special_char(self) -> None:
        """測試反斜線加其他特殊字元"""
        variables = {
            "telegram_bot_token": "token:with\\backslash",
        }
        result = build_vault_yaml(variables)
        # 因為有冒號所以會引用，反斜線會被跳脫
        assert 'telegram_bot_token: "token:with\\\\backslash"' in result
