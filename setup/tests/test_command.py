"""測試命令執行工具"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from setup.utils.command import run_command, run_playbook


class TestRunCommand:
    """run_command 測試"""

    def test_successful_command(self) -> None:
        """測試成功執行命令"""
        result = run_command(["echo", "hello"])
        assert result is not None
        assert result.returncode == 0
        assert "hello" in result.stdout

    def test_failed_command(self) -> None:
        """測試失敗的命令"""
        result = run_command(["false"])
        assert result is not None
        assert result.returncode != 0

    def test_failed_command_with_check(self) -> None:
        """測試失敗命令加上 check"""
        result = run_command(["false"], check=True)
        assert result is None

    def test_nonexistent_command(self) -> None:
        """測試不存在的命令"""
        result = run_command(["nonexistent_command_12345"])
        assert result is None

    def test_with_cwd(self, temp_dir: Path) -> None:
        """測試指定工作目錄"""
        result = run_command(["pwd"], cwd=temp_dir)
        assert result is not None
        assert str(temp_dir) in result.stdout

    def test_capture_output(self) -> None:
        """測試捕獲輸出"""
        result = run_command(["echo", "test"], capture=True)
        assert result is not None
        assert result.stdout == "test\n"

    def test_no_capture_output(self) -> None:
        """測試不捕獲輸出"""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            run_command(["echo", "test"], capture=False)
            mock_run.assert_called_once()
            call_args = mock_run.call_args
            assert call_args.kwargs["capture_output"] is False


class TestRunPlaybook:
    """run_playbook 測試"""

    def test_with_wrapper(self, temp_dir: Path) -> None:
        """測試使用 wrapper"""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = run_playbook(
                playbook_path="playbooks/test.yml",
                root_dir=temp_dir,
                use_wrapper=True,
            )

        assert result is True
        call_args = mock_run.call_args[0][0]
        assert "-m" in call_args
        assert "scripts" in call_args
        assert "ansible" in call_args
        assert "ansible-playbook" in call_args
        assert "ansible/playbooks/test.yml" in call_args

    def test_without_wrapper(self, temp_dir: Path) -> None:
        """測試不使用 wrapper"""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            result = run_playbook(
                playbook_path="playbooks/test.yml",
                root_dir=temp_dir,
                use_wrapper=False,
            )

        assert result is True
        call_args = mock_run.call_args[0][0]
        assert call_args[0] == "ansible-playbook"
        assert "ansible/playbooks/test.yml" in call_args

    def test_playbook_failure(self, temp_dir: Path) -> None:
        """測試 Playbook 執行失敗"""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=1)
            result = run_playbook(
                playbook_path="playbooks/test.yml",
                root_dir=temp_dir,
            )

        assert result is False

    def test_playbook_cwd(self, temp_dir: Path) -> None:
        """測試 Playbook 工作目錄"""
        with patch("subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(returncode=0)
            run_playbook(
                playbook_path="playbooks/test.yml",
                root_dir=temp_dir,
            )

        call_kwargs = mock_run.call_args.kwargs
        assert call_kwargs["cwd"] == temp_dir
