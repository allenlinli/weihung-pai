"""測試 UI 工具"""

from io import StringIO
from unittest.mock import patch

from setup import ui


class TestHeader:
    """header 測試"""

    def test_header_output(self) -> None:
        """測試標題輸出"""
        with patch("sys.stdout", new=StringIO()) as output:
            ui.header("Test Title")
            result = output.getvalue()

        assert "=" * 60 in result
        assert "Test Title" in result


class TestStep:
    """step 測試"""

    def test_step_output(self) -> None:
        """測試步驟輸出"""
        with patch("sys.stdout", new=StringIO()) as output:
            ui.step(1, 4, "Setting up")
            result = output.getvalue()

        assert "[1/4]" in result
        assert "Setting up" in result
        assert "-" * 40 in result


class TestMessages:
    """訊息函數測試"""

    def test_success(self) -> None:
        """測試成功訊息"""
        with patch("sys.stdout", new=StringIO()) as output:
            ui.success("Done!")
            result = output.getvalue()

        assert "✓ Done!" in result

    def test_error(self) -> None:
        """測試錯誤訊息"""
        with patch("sys.stdout", new=StringIO()) as output:
            ui.error("Failed!")
            result = output.getvalue()

        assert "✗ Failed!" in result

    def test_skip(self) -> None:
        """測試跳過訊息"""
        with patch("sys.stdout", new=StringIO()) as output:
            ui.skip("Skipped!")
            result = output.getvalue()

        assert "⊘ Skipped!" in result


class TestAskYesNo:
    """ask_yes_no 測試"""

    def test_yes_input(self) -> None:
        """測試輸入 yes"""
        with patch("builtins.input", return_value="y"):
            result = ui.ask_yes_no("Continue?")
        assert result is True

    def test_yes_full_input(self) -> None:
        """測試輸入完整 yes"""
        with patch("builtins.input", return_value="yes"):
            result = ui.ask_yes_no("Continue?")
        assert result is True

    def test_no_input(self) -> None:
        """測試輸入 no"""
        with patch("builtins.input", return_value="n"):
            result = ui.ask_yes_no("Continue?")
        assert result is False

    def test_no_full_input(self) -> None:
        """測試輸入完整 no"""
        with patch("builtins.input", return_value="no"):
            result = ui.ask_yes_no("Continue?")
        assert result is False

    def test_empty_input_default_true(self) -> None:
        """測試空輸入（預設 True）"""
        with patch("builtins.input", return_value=""):
            result = ui.ask_yes_no("Continue?", default=True)
        assert result is True

    def test_empty_input_default_false(self) -> None:
        """測試空輸入（預設 False）"""
        with patch("builtins.input", return_value=""):
            result = ui.ask_yes_no("Continue?", default=False)
        assert result is False

    def test_case_insensitive(self) -> None:
        """測試大小寫不敏感"""
        with patch("builtins.input", return_value="Y"):
            result = ui.ask_yes_no("Continue?")
        assert result is True

        with patch("builtins.input", return_value="N"):
            result = ui.ask_yes_no("Continue?")
        assert result is False


class TestGetInput:
    """get_input 測試"""

    def test_with_value(self) -> None:
        """測試有輸入值"""
        with patch("builtins.input", return_value="test_value"):
            result = ui.get_input("Enter value")
        assert result == "test_value"

    def test_with_default(self) -> None:
        """測試使用預設值"""
        with patch("builtins.input", return_value=""):
            result = ui.get_input("Enter value", default="default_value")
        assert result == "default_value"

    def test_override_default(self) -> None:
        """測試覆蓋預設值"""
        with patch("builtins.input", return_value="new_value"):
            result = ui.get_input("Enter value", default="default_value")
        assert result == "new_value"

    def test_no_default_empty_input(self) -> None:
        """測試無預設值且空輸入"""
        with patch("builtins.input", return_value=""):
            result = ui.get_input("Enter value")
        assert result is None

    def test_secret_input(self) -> None:
        """測試密碼輸入"""
        with patch("setup.ui.getpass", return_value="secret123"):
            result = ui.get_input("Enter password", secret=True)
        assert result == "secret123"


class TestShowVar:
    """show_var 測試"""

    def test_show_var_basic(self) -> None:
        """測試顯示基本變數"""
        var = {"prompt": "Server IP", "help": "Your VPS IP address"}
        with patch("sys.stdout", new=StringIO()) as output:
            ui.show_var(var)
            result = output.getvalue()

        assert "Server IP" in result
        assert "說明: Your VPS IP address" in result

    def test_show_var_with_value(self) -> None:
        """測試顯示變數含值"""
        var = {"prompt": "Server IP", "help": "Your VPS IP address"}
        with patch("sys.stdout", new=StringIO()) as output:
            ui.show_var(var, value="192.168.1.1")
            result = output.getvalue()

        assert "目前值: 192.168.1.1" in result

    def test_show_var_secret_masked(self) -> None:
        """測試密碼變數遮蔽"""
        var = {"prompt": "API Key", "help": "Your API key", "secret": True}
        with patch("sys.stdout", new=StringIO()) as output:
            ui.show_var(var, value="secret123")
            result = output.getvalue()

        assert "目前值: ********" in result
        assert "secret123" not in result
