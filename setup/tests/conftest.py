"""pytest fixtures"""

import json
import tempfile
from collections.abc import Iterator
from pathlib import Path

import pytest


@pytest.fixture
def temp_dir() -> Iterator[Path]:
    """建立臨時目錄"""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def state_file(temp_dir: Path) -> Path:
    """建立臨時狀態檔案路徑"""
    return temp_dir / ".setup_state.json"


@pytest.fixture
def sample_state_data() -> dict:
    """範例狀態資料"""
    return {
        "vault_password_set": True,
        "vault_created": True,
        "vault_encrypted": False,
        "ssh_key_generated": True,
        "variables": {
            "vault_server_ip": "192.168.1.1",
            "telegram_bot_token": "secret_token",
        },
        "optional_declined": ["vultr"],
        "playbooks_completed": ["init-user"],
    }


@pytest.fixture
def state_file_with_data(state_file: Path, sample_state_data: dict) -> Path:
    """建立含有資料的狀態檔案"""
    state_file.write_text(json.dumps(sample_state_data))
    return state_file
