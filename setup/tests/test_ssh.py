"""測試 SSH 工具"""

from unittest.mock import MagicMock, patch

from setup.utils.ssh import generate_ssh_key


class TestGenerateSshKey:
    """generate_ssh_key 測試"""

    def test_successful_generation(self) -> None:
        """測試成功產生 SSH Key"""
        # 實際呼叫 ssh-keygen 測試
        private_key, public_key = generate_ssh_key()

        assert private_key is not None
        assert public_key is not None
        assert "-----BEGIN OPENSSH PRIVATE KEY-----" in private_key
        assert "-----END OPENSSH PRIVATE KEY-----" in private_key
        assert "ssh-ed25519" in public_key
        assert "pai-agent" in public_key

    def test_command_failure(self) -> None:
        """測試命令失敗"""
        with patch("setup.utils.ssh.run_command") as mock_run:
            mock_run.return_value = MagicMock(returncode=1)
            private_key, public_key = generate_ssh_key()

        assert private_key is None
        assert public_key is None

    def test_command_exception(self) -> None:
        """測試命令異常"""
        with patch("setup.utils.ssh.run_command") as mock_run:
            mock_run.return_value = None
            private_key, public_key = generate_ssh_key()

        assert private_key is None
        assert public_key is None
