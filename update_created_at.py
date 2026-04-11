#!/usr/bin/env python3
"""Instagram生データからcreated_atを更新する
手順: fly sftp でDBをローカルにダウンロード → Python sqlite3 で更新 → アップロード
"""

import json
import os
import sqlite3
import subprocess
import tempfile
from datetime import datetime, timezone

POSTS_JSON = "/Users/o46/Downloads/meta-2026-Apr-11-05-13-07/instagram-with_submariner_life-2026-04-11-ehiDLP4m/your_instagram_activity/media/posts_1.json"
FLY_APP = "rust-blog-api"
DB_REMOTE = "/data/blog.db"


def make_slug(date_str: str, index: int) -> str:
    return f"{date_str}-{index:03d}"


def build_updates(posts_json_path: str) -> list[tuple[str, str, str]]:
    with open(posts_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    updates = []
    for i, post in enumerate(data):
        medias = post.get("media", [])
        if not medias:
            continue
        ts = medias[0].get("creation_timestamp", 0)
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        iso = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        slug = make_slug(dt.strftime("%Y-%m-%d"), i)
        updates.append((iso, iso, slug))
    return updates


def main():
    updates = build_updates(POSTS_JSON)
    print(f"{len(updates)} 件の更新を生成")
    print("サンプル:")
    for iso, _, slug in updates[:3]:
        print(f"  slug={slug}  →  created_at={iso}")

    local_db = tempfile.mktemp(suffix=".db")  # パスだけ取得、ファイルは作らない

    try:
        # ── 1. ダウンロード ──────────────────────────────────────────
        print(f"\nDBをダウンロード中 → {local_db}")
        r = subprocess.run(
            ["fly", "sftp", "get", "-a", FLY_APP, DB_REMOTE, local_db],
            capture_output=True, text=True
        )
        if r.returncode != 0:
            print("ダウンロード失敗:", r.stderr)
            return

        # ── 2. ローカルで更新 ────────────────────────────────────────
        con = sqlite3.connect(local_db)
        cur = con.cursor()
        affected = 0
        for iso, iso2, slug in updates:
            cur.execute(
                "UPDATE posts SET created_at=?, updated_at=? WHERE slug=?",
                (iso, iso2, slug)
            )
            affected += cur.rowcount
        con.commit()
        con.close()
        print(f"ローカルDB更新完了: {affected} 件")

        # ── 3. アップロード（/data/blog_new.db に置いてから mv） ────────
        db_tmp = DB_REMOTE.replace(".db", "_new.db")
        print(f"DBをアップロード中 → {db_tmp}")
        r = subprocess.run(
            ["fly", "sftp", "put", "-a", FLY_APP, local_db, db_tmp],
            capture_output=True, text=True
        )
        if r.returncode != 0:
            print("アップロード失敗:", r.stderr)
            return

        print(f"リモートで mv {db_tmp} → {DB_REMOTE}")
        r = subprocess.run(
            ["fly", "ssh", "console", "-a", FLY_APP, "-C", f"mv {db_tmp} {DB_REMOTE}"],
            capture_output=True, text=True
        )
        if r.returncode == 0:
            print("✓ 完了")
        else:
            print("mv 失敗:", r.stderr)
    finally:
        os.unlink(local_db)


if __name__ == "__main__":
    main()
