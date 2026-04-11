// Rust API の models.rs と対応する型定義
// pnpm generate 実行後は src/api/generated/ の型に置き換えられる

export type UserResponse = {
  id: string
  username: string
  email: string
  role: string
  created_at: string
}

export type Post = {
  id: string
  title: string
  slug: string
  content: string
  author_id: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export type LoginResponse = {
  token: string
  user: UserResponse
}

export type CreatePostRequest = {
  title: string
  slug: string
  content: string
  status?: 'draft' | 'published'
}

export type UpdatePostRequest = {
  title?: string
  slug?: string
  content?: string
  status?: 'draft' | 'published'
}
