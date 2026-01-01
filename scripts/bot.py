"""Bot 狀態監控工具"""

from .ssh import ssh_to_vps


def status() -> int:
    """查看 bot 服務狀態"""
    return ssh_to_vps("systemctl status pai-bot --no-pager")


def logs(lines: int = 50, follow: bool = False) -> int:
    """
    查看 bot 日誌

    Args:
        lines: 顯示行數
        follow: 是否持續追蹤
    """
    cmd = f"journalctl -u pai-bot -n {lines} --no-pager"
    if follow:
        cmd = "journalctl -u pai-bot -f"
    return ssh_to_vps(cmd)


def restart() -> int:
    """重啟 bot 服務"""
    cmd = "sudo systemctl restart pai-bot && sleep 1 && systemctl status pai-bot --no-pager"
    return ssh_to_vps(cmd)
