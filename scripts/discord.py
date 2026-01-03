"""Discord Bot 工具"""

from .vault import get_vault_value


def invite() -> int:
    """生成 Discord Bot 邀請連結"""
    client_id = get_vault_value("discord_client_id")
    if not client_id:
        print("錯誤: vault 中缺少 discord_client_id")
        return 1

    url = (
        f"https://discord.com/oauth2/authorize"
        f"?client_id={client_id}"
        f"&permissions=8"
        f"&integration_type=0"
        f"&scope=bot+applications.commands"
    )
    print(url)
    return 0
