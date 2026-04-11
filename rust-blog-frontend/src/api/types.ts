export type UserResponse = {
  id: string
  username: string
  email: string
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
  location?: string
  post_date?: string
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
