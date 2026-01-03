"""YouTube VNC tools for cookie refresh"""

import subprocess

from .ssh import ssh_to_vps


def vnc_start() -> int:
    """Start VNC session for YouTube login"""
    print("Starting YouTube VNC on VPS...")
    return ssh_to_vps("/home/pai/youtube-vnc.sh start")


def vnc_stop() -> int:
    """Stop VNC session"""
    print("Stopping YouTube VNC...")
    return ssh_to_vps("/home/pai/youtube-vnc.sh stop")


def vnc_export() -> int:
    """Export cookies from Firefox"""
    print("Exporting YouTube cookies...")
    return ssh_to_vps("/home/pai/youtube-vnc.sh export")


def vnc_status() -> int:
    """Check VNC status"""
    return ssh_to_vps("/home/pai/youtube-vnc.sh status")
