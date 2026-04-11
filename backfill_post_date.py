#!/usr/bin/env python3
"""既存インポート済み投稿に post_date を Instagram の creation_timestamp からバックフィルする"""

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


def main():
    with open(POSTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    updates = []
    for i, post in enumerate(data):
        medias = post.get("media", [])
        if not medias:
            continue
        ts = medias[0].get("creation_timestamp", 0)
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        post_date = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        slug = make_slug(dt.strftime("%Y-%m-%d"), i)
        updates.append((post_date, slug))

    print(f"{len(updates)} 件のバックフィルを準備")
    print("サンプル:")
    for pd, slug in updates[:3]:
        print(f"  slug={slug}  post_date={pd}")

    local_db = tempfile.mktemp(suffix=".db")
    try:
        print(f"\nDBダウンロード中 → {local_db}")
        r = subprocess.run(
            ["fly", "sftp", "get", "-a", FLY_APP, DB_REMOTE, local_db],
            capture_output=True, text=True
        )
        if r.returncode != 0:
            print("ダウンロード失敗:", r.stderr)
            return

        con = sqlite3.connect(local_db)
        cur = con.cursor()
        affected = 0
        for post_date, slug in updates:
            cur.execute("UPDATE posts SET post_date=? WHERE slug=?", (post_date, slug))
            affected += cur.rowcount
        con.commit()
        con.close()
        print(f"ローカルDB更新完了: {affected} 件")

        db_tmp = DB_REMOTE.replace(".db", "_new.db")
        print(f"アップロード中 → {db_tmp}")
        r = subprocess.run(
            ["fly", "sftp", "put", "-a", FLY_APP, local_db, db_tmp],
            capture_output=True, text=True
        )
        if r.returncode != 0:
            print("アップロード失敗:", r.stderr)
            return

        r = subprocess.run(
            ["fly", "ssh", "console", "-a", FLY_APP, "-C", f"mv {db_tmp} {DB_REMOTE}"],
            capture_output=True, text=True
        )
        if r.returncode == 0:
            print("✓ 完了")
        else:
            print("mv 失敗:", r.stderr)
    finally:
        if os.path.exists(local_db):
            os.unlink(local_db)


if __name__ == "__main__":
    main()
