export type UserResponse = {
  id: string
  username: string
  email: string
  role: string
  url_path: string | null
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

export type PublicProfile = {
  username: string
  url_path: string
  posts: Post[]
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
