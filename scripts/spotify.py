"""Spotify/Librespot tools"""

from .ssh import ssh_to_vps


def do_auth() -> int:
    """Start librespot for Spotify Connect authentication"""
    print("Starting librespot for Spotify Connect...")
    print()
    print("Instructions:")
    print("1. Open Spotify app on your phone/computer")
    print("2. Play any song")
    print("3. Click the 'Devices' icon")
    print("4. Select 'Merlin DJ' from the device list")
    print("5. Press Ctrl+C to stop when done")
    print()

    return ssh_to_vps(
        "/home/pai/.cargo/bin/librespot "
        "--name 'Merlin DJ' "
        "--backend pipe "
        "--initial-volume 100 "
        "--verbose"
    )


def do_test() -> int:
    """Test if librespot is installed"""
    print("Testing librespot installation...")
    return ssh_to_vps("/home/pai/.cargo/bin/librespot --version")


def do_token() -> int:
    """Not applicable for Spotify Connect mode"""
    print("Spotify Connect mode doesn't require manual token management.")
    print("Just select 'Merlin DJ' from your Spotify app's device list.")
    return 0
