# rust-blog-api

Rust + Axum + SQLite によるシングルユーザー向けブログ REST API。

[![Fly.io](https://img.shields.io/badge/fly.io-deployed-purple?logo=flydotio&logoColor=white)](https://rust-blog-api.fly.dev/api-docs/)
[![Vercel](https://img.shields.io/badge/vercel-deployed-black?logo=vercel&logoColor=white)](https://ramen-blog-rs.vercel.app/)

🚀 **[ら〜めんブログ🍜](https://ramen-blog-rs.vercel.app/)** — 公開中

フロントエンド: [rust-blog-frontend](../rust-blog-frontend)

## Tech Stack

- **Rust** 1.85+（edition 2024）
- **Axum** 0.7 — Web フレームワーク
- **SQLite** + sqlx 0.7 — データベース
- **argon2** — パスワードハッシュ
- **jsonwebtoken** — JWT 認証
- **utoipa** — OpenAPI 自動生成

## 起動方法

### 前提

Rust 1.85 以上が必要。[mise](https://mise.jdx.dev/) を使っている場合：

```bash
mise install rust@1.94.1
```

### 手順

```bash
# DBファイルを作成（初回のみ）
touch blog.db

# 起動
mise exec rust@1.94.1 -- cargo run
# または Rust 1.85+ がデフォルトなら
cargo run
```

サーバーが `http://localhost:3000` で起動します。

### 環境変数

`.env` ファイルを作成することで上書きできます（任意）：

```env
DATABASE_URL=sqlite:blog.db
JWT_SECRET=your-secret-key
UPLOAD_DIR=./uploads
RUST_LOG=rust_blog_api=debug
```

## API エンドポイント

| Method | Path | 説明 | 認証 |
|--------|------|------|------|
| POST | `/api/auth/register` | ユーザー登録（初回のみ） | 不要 |
| POST | `/api/auth/login` | ログイン・JWT 発行 | 不要 |
| GET | `/api/posts` | 公開記事一覧 | 不要 |
| GET | `/api/posts/:id` | 記事詳細 | 不要 |
| POST | `/api/posts` | 記事作成 | 必要 |
| PUT | `/api/posts/:id` | 記事更新 | 必要 |
| DELETE | `/api/posts/:id` | 記事削除 | 必要 |
| GET | `/api/posts/all` | 全記事（下書き含む） | 必要 |
| GET | `/api/users/me` | 自分の情報 | 必要 |
| POST | `/api/uploads` | 画像アップロード | 必要 |

認証が必要なエンドポイントは `Authorization: Bearer <token>` ヘッダーを付与してください。

## Swagger UI

起動後、ブラウザで確認できます：

```
http://localhost:3000/api-docs
```

## ファイル構成

```
src/
├── main.rs          # エントリポイント・ルーティング
├── error.rs         # エラー型
├── jwt.rs           # JWT 生成・検証・Extractor
├── models.rs        # 構造体定義
└── handlers/
    ├── auth.rs      # 登録・ログイン
    ├── posts.rs     # 記事 CRUD
    ├── users.rs     # ユーザー情報
    └── uploads.rs   # 画像アップロード
migrations/
├── 001_init.sql
└── 002_add_url_path.sql
```
