#!/usr/bin/env python3
"""Instagram posts → ramen-blog importer"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone

import requests

# ── 設定 ───────────────────────────────────────────────────────────────────────

API_BASE   = "https://rust-blog-api.fly.dev"
TOKEN      = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2ZDdlN2RhYi04ZTAyLTQxZTYtYjk1Zi0wNzU2NmE1Y2QzODEiLCJleHAiOjE3NzYwMDA5MDJ9.gYB94_lf3xBkkh7G8yXJSNuYBxWtF9lPZDShMB8R-ts"
POSTS_JSON = "/Users/o46/Downloads/meta-2026-Apr-11-05-13-07/instagram-with_submariner_life-2026-04-11-ehiDLP4m/your_instagram_activity/media/posts_1.json"
MEDIA_BASE = "/Users/o46/Downloads/meta-2026-Apr-11-05-13-07/instagram-with_submariner_life-2026-04-11-ehiDLP4m"

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# ── ヘルパー ──────────────────────────────────────────────────────────────────

def fix_encoding(s: str) -> str:
    try:
        return s.encode("latin-1").decode("utf-8")
    except Exception:
        return s

def load_posts():
    with open(POSTS_JSON, "r", encoding="utf-8") as f:
        raw = f.read()
    return json.loads(raw)

def get_exif(media: dict) -> dict:
    return (
        media.get("media_metadata", {})
             .get("photo_metadata", {})
             .get("exif_data", [{}])[0]
    )

def make_slug(date_str: str, index: int) -> str:
    return f"{date_str}-{index:03d}"

def upload_image(image_path: str) -> str | None:
    if not os.path.exists(image_path):
        print(f"  [WARN] image not found: {image_path}")
        return None
    with open(image_path, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/api/uploads",
            headers=HEADERS,
            files={"file": (os.path.basename(image_path), f)},
        )
    if resp.status_code == 200:
        url = resp.json().get("url", "")
        return url
    print(f"  [WARN] upload failed: {resp.status_code} {resp.text[:100]}")
    return None

def create_post(title: str, slug: str, content: str, location: str | None, post_date: str | None, status: str = "published") -> bool:
    payload = {
        "title": title,
        "slug": slug,
        "content": content,
        "status": status,
    }
    if location:
        payload["location"] = location
    if post_date:
        payload["post_date"] = post_date
    resp = requests.post(
        f"{API_BASE}/api/posts",
        headers={**HEADERS, "Content-Type": "application/json"},
        json=payload,
    )
    if resp.status_code == 201:
        return True
    print(f"  [ERROR] create_post failed: {resp.status_code} {resp.text[:200]}")
    return False

# ── メイン ────────────────────────────────────────────────────────────────────

def process_post(post: dict, index: int) -> bool:
    medias = post.get("media", [])
    if not medias:
        return False

    media = medias[0]
    raw_title = fix_encoding(media.get("title", ""))
    ts = media.get("creation_timestamp", 0)
    dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    date_str = dt.strftime("%Y-%m-%d")
    post_date = dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    lines = [l for l in raw_title.strip().splitlines()]
    first_line = lines[0].strip() if lines else ""

    # タイトル: 1行目が店名っぽければそれ、なければ日付
    if first_line:
        title = first_line
        location = first_line  # 1行目を location にも使う
        body_lines = lines[1:]
    else:
        title = date_str
        location = None
        body_lines = lines

    # 複数画像対応：全画像アップロード
    image_urls = []
    for m in medias:
        uri = m.get("uri", "")
        image_path = os.path.join(MEDIA_BASE, uri)
        if uri.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            url = upload_image(image_path)
            if url:
                image_urls.append(url)

    # 本文構築
    content_parts = []
    for url in image_urls:
        content_parts.append(f"![]({url})")
    body_text = "\n".join(body_lines).strip()
    if body_text:
        content_parts.append(body_text)
    content = "\n\n".join(content_parts)

    slug = make_slug(date_str, index)

    print(f"[{index:03d}] {date_str} | {title[:40]}")
    ok = create_post(title, slug, content, location, post_date)
    if ok:
        print(f"       ✓ posted (images: {len(image_urls)})")
    return ok

def main():
    data = load_posts()
    print(f"Total posts: {len(data)}")

    ok_count = 0
    skip_count = 0

    for i, post in enumerate(data):
        try:
            ok = process_post(post, i)
            if ok:
                ok_count += 1
            else:
                skip_count += 1
            time.sleep(0.3)  # rate limit 対策
        except Exception as e:
            print(f"  [ERROR] post {i}: {e}")
            skip_count += 1

    print(f"\nDone. success={ok_count}, skip/error={skip_count}")

if __name__ == "__main__":
    main()
