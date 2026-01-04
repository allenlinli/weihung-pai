"""Git skip-worktree 管理工具"""

import subprocess


def get_skip_worktree_files() -> list[str]:
    """取得所有 skip-worktree 的檔案"""
    result = subprocess.run(
        ["git", "ls-files", "-v"],
        capture_output=True,
        text=True,
    )
    return [
        line[2:]  # 移除 "S " 前綴
        for line in result.stdout.strip().split("\n")
        if line.startswith("S ")
    ]


def list_skipped() -> int:
    """列出所有被忽略的檔案"""
    files = get_skip_worktree_files()
    if not files:
        print("沒有被 skip-worktree 忽略的檔案")
        return 0

    print(f"被 skip-worktree 忽略的檔案 ({len(files)} 個):\n")
    for f in files:
        print(f"  {f}")
    return 0


def track(file: str) -> int:
    """暫時恢復追蹤"""
    result = subprocess.run(
        ["git", "update-index", "--no-skip-worktree", file],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"錯誤: {result.stderr}")
        return 1
    print(f"已恢復追蹤: {file}")
    return 0


def untrack(file: str) -> int:
    """重新設定 skip-worktree"""
    result = subprocess.run(
        ["git", "update-index", "--skip-worktree", file],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"錯誤: {result.stderr}")
        return 1
    print(f"已忽略追蹤: {file}")
    return 0


def commit_with_restore() -> int:
    """互動式選擇檔案，commit 後自動恢復 skip-worktree"""
    files = get_skip_worktree_files()
    if not files:
        print("沒有被 skip-worktree 忽略的檔案")
        return 0

    print("被忽略的檔案:")
    for i, f in enumerate(files, 1):
        print(f"  {i}. {f}")

    print()
    selection = input("選擇要追蹤的檔案編號（逗號分隔，或 'all'）: ").strip()

    if not selection:
        print("取消操作")
        return 0

    if selection.lower() == "all":
        selected = files
    else:
        try:
            indices = [int(x.strip()) - 1 for x in selection.split(",")]
            selected = [files[i] for i in indices if 0 <= i < len(files)]
        except (ValueError, IndexError):
            print("無效的選擇")
            return 1

    if not selected:
        print("沒有選擇任何檔案")
        return 0

    # 恢復追蹤
    print("\n恢復追蹤:")
    for f in selected:
        subprocess.run(["git", "update-index", "--no-skip-worktree", f])
        print(f"  ✓ {f}")

    # 顯示狀態
    print("\n目前 git 狀態:")
    subprocess.run(["git", "status", "--short"])

    print("\n請執行 git add 和 git commit，完成後按 Enter 恢復忽略...")
    input()

    # 恢復 skip-worktree
    print("\n恢復忽略:")
    for f in selected:
        subprocess.run(["git", "update-index", "--skip-worktree", f])
        print(f"  ✓ {f}")

    return 0
