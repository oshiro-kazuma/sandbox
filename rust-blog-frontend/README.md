# rust-blog-frontend

React + TypeScript + Vite によるシングルユーザー向けブログフロントエンド。

[![Vercel](https://img.shields.io/badge/vercel-deployed-black?logo=vercel&logoColor=white)](https://ramen-blog-rs.vercel.app/)

**Blog:** [ら〜めんブログ🍜](https://ramen-blog-rs.vercel.app/)

## Tech Stack

- **React** 18 + **TypeScript**
- **Vite** 5 — ビルドツール
- **React Router** v6 — ルーティング
- **TanStack Query** v5 — サーバーステート管理
- **axios** — HTTP クライアント
- **react-markdown** + remark-gfm — Markdown レンダリング

## 起動方法

### 前提

Node.js 18 以上が必要。

### 手順

```bash
# 依存パッケージのインストール（初回のみ）
npm install

# 開発サーバー起動
npm run dev
```

`http://localhost:5173` でアクセスできます。  
バックエンド（`rust-blog-api`）を先に起動しておく必要があります。

### ビルド

```bash
npm run build
# dist/ に出力されます
```

### 環境変数

デフォルトではバックエンドの `http://localhost:3000` にリクエストします。  
別のURLに向ける場合は `.env.local` を作成してください：

```env
VITE_API_URL=http://localhost:3000
```

## ページ一覧

| Path | 説明 | 認証 |
|------|------|------|
| `/` | 記事一覧（全文・Markdown表示） | 不要 |
| `/posts/:id` | 記事詳細 | 不要 |
| `/login` | ログイン | - |
| `/dashboard` | 記事管理（作成・編集・削除・画像添付） | 必要 |

## ファイル構成

```
src/
├── App.tsx              # ルーティング定義
├── main.tsx             # エントリポイント
├── index.css            # グローバルスタイル
├── api/
│   ├── index.ts         # API クライアント関数
│   └── types.ts         # 型定義
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── auth.tsx         # 認証コンテキスト
│   └── axios.ts         # axios インスタンス（JWT 自動付与）
└── pages/
    ├── Home.tsx         # 記事一覧
    ├── PostDetail.tsx   # 記事詳細
    ├── Login.tsx        # ログイン
    └── Dashboard.tsx    # 管理画面
```
