import { customInstance } from '../lib/axios'
import type {
  CreatePostRequest,
  LoginResponse,
  Post,
  PublicProfile,
  UpdatePostRequest,
  UserResponse,
} from './types'

export const authApi = {
  register: (body: { username: string; email: string; password: string; url_path: string }) =>
    customInstance<UserResponse>({ method: 'POST', url: '/api/auth/register', data: body }),

  login: (body: { email: string; password: string }) =>
    customInstance<LoginResponse>({ method: 'POST', url: '/api/auth/login', data: body }),
}

export const postsApi = {
  list: () =>
    customInstance<Post[]>({ method: 'GET', url: '/api/posts' }),

  get: (id: string) =>
    customInstance<Post>({ method: 'GET', url: `/api/posts/${id}` }),

  create: (body: CreatePostRequest) =>
    customInstance<Post>({ method: 'POST', url: '/api/posts', data: body }),

  update: (id: string, body: UpdatePostRequest) =>
    customInstance<Post>({ method: 'PUT', url: `/api/posts/${id}`, data: body }),

  remove: (id: string) =>
    customInstance<void>({ method: 'DELETE', url: `/api/posts/${id}` }),
}

export const usersApi = {
  list: () =>
    customInstance<UserResponse[]>({ method: 'GET', url: '/api/users' }),

  me: () =>
    customInstance<UserResponse>({ method: 'GET', url: '/api/users/me' }),

  updateProfile: (body: { url_path: string }) =>
    customInstance<UserResponse>({ method: 'PATCH', url: '/api/users/me', data: body }),
}

export const profilesApi = {
  get: (urlPath: string) =>
    customInstance<PublicProfile>({ method: 'GET', url: `/api/u/${urlPath}` }),

  getPost: (urlPath: string, slug: string) =>
    customInstance<Post>({ method: 'GET', url: `/api/u/${urlPath}/posts/${slug}` }),
}

export const uploadsApi = {
  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return customInstance<{ url: string }>({
      method: 'POST',
      url: '/api/uploads',
      data: form,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
