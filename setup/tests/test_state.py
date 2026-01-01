"""測試 SetupState"""

import json
from pathlib import Path
from unittest.mock import patch

from setup.state import SetupState


class TestSetupState:
    """SetupState 測試"""

    def test_default_values(self) -> None:
        """測試預設值"""
        state = SetupState()
        assert state.vault_password_set is False
        assert state.vault_created is False
        assert state.vault_encrypted is False
        assert state.ssh_key_generated is False
        assert state.variables == {}
        assert state.optional_declined == []
        assert state.playbooks_completed == []

    def test_load_from_file(
        self, state_file_with_data: Path, sample_state_data: dict[str, object]
    ) -> None:
        """測試從檔案載入"""
        with patch("setup.state.STATE_FILE", state_file_with_data):
            state = SetupState.load()

        assert state.vault_password_set is True
        assert state.vault_created is True
        assert state.variables == sample_state_data["variables"]
        assert state.playbooks_completed == ["init-user"]

    def test_load_nonexistent_file(self, temp_dir: Path) -> None:
        """測試載入不存在的檔案"""
        nonexistent = temp_dir / "nonexistent.json"
        with patch("setup.state.STATE_FILE", nonexistent):
            state = SetupState.load()

        assert state.vault_password_set is False
        assert state.variables == {}

    def test_save(self, state_file: Path) -> None:
        """測試儲存狀態"""
        with patch("setup.state.STATE_FILE", state_file):
            state = SetupState()
            state.vault_password_set = True
            state.variables = {"key": "value"}
            state.save()

        data = json.loads(state_file.read_text())
        assert data["vault_password_set"] is True
        assert data["variables"] == {"key": "value"}

    def test_reset(self, state_file: Path) -> None:
        """測試重置狀態"""
        with patch("setup.state.STATE_FILE", state_file):
            state = SetupState(
                vault_password_set=True,
                vault_created=True,
                variables={"key": "value"},
            )
            state.reset()

        assert state.vault_password_set is False
        assert state.vault_created is False
        assert state.variables == {}

    def test_has_progress_true(self) -> None:
        """測試有進度的情況"""
        # vault_password_set
        state = SetupState(vault_password_set=True)
        assert state.has_progress() is True

        # vault_created
        state = SetupState(vault_created=True)
        assert state.has_progress() is True

        # variables
        state = SetupState(variables={"key": "value"})
        assert state.has_progress() is True

        # playbooks_completed
        state = SetupState(playbooks_completed=["init-user"])
        assert state.has_progress() is True

    def test_has_progress_false(self) -> None:
        """測試無進度的情況"""
        state = SetupState()
        assert state.has_progress() is False

    def test_summary(self) -> None:
        """測試進度摘要"""
        state = SetupState(
            vault_password_set=True,
            vault_created=True,
            variables={"a": 1, "b": 2, "c": 3},
            playbooks_completed=["init-user", "setup-vps"],
        )
        summary = state.summary()

        assert summary == {
            "vault_password": True,
            "vault_file": True,
            "variables_count": 3,
            "playbooks_count": 2,
        }
