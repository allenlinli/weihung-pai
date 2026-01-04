#!/usr/bin/env python3
"""Obsidian RAG 索引工具 - 使用 ChromaDB 內建 embedding"""

import hashlib
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import chromadb

# 設定
CHUNK_SIZE = 500  # 字元數
CHUNK_OVERLAP = 50


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """將文字切成 chunks"""
    # 移除 frontmatter
    text = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.DOTALL)

    # 按段落切分
    paragraphs = re.split(r"\n\n+", text)

    chunks = []
    current_chunk = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current_chunk) + len(para) < chunk_size:
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para + "\n\n"

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # 如果 chunk 太長，再切分
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > chunk_size * 2:
            # 按句子切分
            sentences = re.split(r"(?<=[。！？.!?])\s*", chunk)
            sub_chunk = ""
            for sent in sentences:
                if len(sub_chunk) + len(sent) < chunk_size:
                    sub_chunk += sent
                else:
                    if sub_chunk:
                        final_chunks.append(sub_chunk.strip())
                    sub_chunk = sent
            if sub_chunk:
                final_chunks.append(sub_chunk.strip())
        else:
            final_chunks.append(chunk)

    return [c for c in final_chunks if len(c) > 20]  # 過濾太短的


def generate_chunk_id(file_path: str, chunk_index: int) -> str:
    """產生 chunk 的唯一 ID"""
    return hashlib.md5(f"{file_path}:{chunk_index}".encode()).hexdigest()


class ObsidianRAG:
    """Obsidian RAG 索引管理器（使用 ChromaDB 內建 embedding）"""

    def __init__(
        self,
        vault_path: str | Path,
        db_path: str | Path | None = None,
    ):
        self.vault_path = Path(vault_path).expanduser()

        # ChromaDB 設定
        if db_path is None:
            db_path = Path.home() / ".chromadb" / "obsidian"
        self.db_path = Path(db_path).expanduser()
        self.db_path.mkdir(parents=True, exist_ok=True)

        self.client = chromadb.PersistentClient(path=str(self.db_path))
        # 使用 ChromaDB 內建的 embedding function (all-MiniLM-L6-v2)
        self.collection = self.client.get_or_create_collection(
            name="obsidian_vault",
            metadata={"hnsw:space": "cosine"},
        )

        # 檔案狀態追蹤 collection
        self.meta_collection = self.client.get_or_create_collection(name="obsidian_meta")

    def _get_file_mtime(self, file_path: Path) -> str:
        """取得檔案修改時間"""
        return datetime.fromtimestamp(file_path.stat().st_mtime, tz=UTC).isoformat()

    def _get_stored_mtime(self, rel_path: str) -> str | None:
        """取得已儲存的修改時間"""
        result = self.meta_collection.get(ids=[rel_path])
        if result["metadatas"] and result["metadatas"][0]:
            mtime = result["metadatas"][0].get("mtime")
            return str(mtime) if mtime is not None else None
        return None

    def _update_stored_mtime(self, rel_path: str, mtime: str) -> None:
        """更新儲存的修改時間"""
        self.meta_collection.upsert(
            ids=[rel_path],
            metadatas=[{"mtime": mtime, "indexed_at": datetime.now(tz=UTC).isoformat()}],
            documents=[rel_path],  # ChromaDB 需要 documents
        )

    def _delete_file_chunks(self, rel_path: str) -> int:
        """刪除檔案的所有 chunks"""
        # 找出這個檔案的所有 chunks
        results = self.collection.get(where={"file_path": rel_path})
        if results["ids"]:
            self.collection.delete(ids=results["ids"])
            return len(results["ids"])
        return 0

    def index_file(self, file_path: Path) -> int:
        """索引單一檔案，回傳 chunk 數量"""
        rel_path = str(file_path.relative_to(self.vault_path))
        current_mtime = self._get_file_mtime(file_path)
        stored_mtime = self._get_stored_mtime(rel_path)

        # 檢查是否需要更新
        if stored_mtime == current_mtime:
            return 0  # 沒有變更

        # 刪除舊的 chunks
        self._delete_file_chunks(rel_path)

        # 讀取檔案
        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception as e:
            print(f"  無法讀取 {rel_path}: {e}")
            return 0

        # 切 chunks
        chunks = chunk_text(content)
        if not chunks:
            return 0

        # 準備資料（ChromaDB 會自動產生 embeddings）
        ids = [generate_chunk_id(rel_path, i) for i in range(len(chunks))]
        metadatas = [
            {
                "file_path": rel_path,
                "chunk_index": i,
                "mtime": current_mtime,
            }
            for i in range(len(chunks))
        ]

        # 使用 ChromaDB 內建 embedding
        self.collection.upsert(
            ids=ids,
            documents=chunks,
            metadatas=metadatas,  # type: ignore[arg-type]
        )

        # 更新 meta
        self._update_stored_mtime(rel_path, current_mtime)

        return len(ids)

    def sync(self) -> dict[str, int]:
        """同步整個 vault，回傳統計"""
        stats = {"added": 0, "updated": 0, "deleted": 0, "unchanged": 0}

        # 取得所有已索引的檔案
        all_meta = self.meta_collection.get()
        indexed_files = set(all_meta["ids"]) if all_meta["ids"] else set()

        # 掃描 vault
        current_files = set()
        for md_file in self.vault_path.rglob("*.md"):
            # 跳過隱藏資料夾
            if any(part.startswith(".") for part in md_file.parts):
                continue

            rel_path = str(md_file.relative_to(self.vault_path))
            current_files.add(rel_path)

            stored_mtime = self._get_stored_mtime(rel_path)
            is_new = stored_mtime is None

            chunks_indexed = self.index_file(md_file)

            if chunks_indexed > 0:
                if is_new:
                    stats["added"] += 1
                    print(f"  + {rel_path} ({chunks_indexed} chunks)")
                else:
                    stats["updated"] += 1
                    print(f"  * {rel_path} ({chunks_indexed} chunks)")
            else:
                stats["unchanged"] += 1

        # 刪除不存在的檔案
        deleted_files = indexed_files - current_files
        for rel_path in deleted_files:
            deleted_chunks = self._delete_file_chunks(rel_path)
            self.meta_collection.delete(ids=[rel_path])
            stats["deleted"] += 1
            print(f"  - {rel_path} ({deleted_chunks} chunks)")

        return stats

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """語意搜尋（使用 ChromaDB 內建 embedding）"""
        results = self.collection.query(
            query_texts=[query],  # ChromaDB 會自動產生 query embedding
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        output: list[dict[str, Any]] = []
        metadatas = results.get("metadatas") or [[]]
        documents = results.get("documents") or [[]]
        distances = results.get("distances") or [[]]

        for i in range(len(results["ids"][0])):
            output.append(
                {
                    "file_path": metadatas[0][i]["file_path"],
                    "chunk": documents[0][i],
                    "distance": distances[0][i],
                }
            )

        return output

    def stats(self) -> dict[str, Any]:
        """取得統計資訊"""
        return {
            "total_chunks": self.collection.count(),
            "total_files": self.meta_collection.count(),
            "db_path": str(self.db_path),
        }


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Obsidian RAG 索引工具")
    parser.add_argument("command", choices=["sync", "search", "stats"], help="執行的命令")
    parser.add_argument("--vault", default="~/obsidian", help="Vault 路徑")
    parser.add_argument("--db", default=None, help="ChromaDB 路徑")
    parser.add_argument("--query", "-q", help="搜尋查詢")
    parser.add_argument("--top-k", "-k", type=int, default=5, help="回傳數量")

    args = parser.parse_args()

    rag = ObsidianRAG(args.vault, args.db)

    if args.command == "sync":
        print(f"同步 {args.vault} ...")
        stats = rag.sync()
        print(
            f"\n完成: +{stats['added']} *{stats['updated']} "
            f"-{stats['deleted']} ={stats['unchanged']}"
        )

    elif args.command == "search":
        if not args.query:
            print("請提供 --query 參數")
            return
        results = rag.search(args.query, args.top_k)
        for i, r in enumerate(results, 1):
            print(f"\n--- {i}. {r['file_path']} (distance: {r['distance']:.4f}) ---")
            print(r["chunk"][:200] + "..." if len(r["chunk"]) > 200 else r["chunk"])

    elif args.command == "stats":
        s = rag.stats()
        print(f"檔案數: {s['total_files']}")
        print(f"Chunks: {s['total_chunks']}")
        print(f"DB 路徑: {s['db_path']}")


if __name__ == "__main__":
    main()
