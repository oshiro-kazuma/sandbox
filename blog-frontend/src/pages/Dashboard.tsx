import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { postsApi, uploadsApi } from '../api'
import { useAuth } from '../lib/auth'
import type { Post } from '../api/types'

export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState({ title: '', slug: '', content: '', status: 'draft' as const })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setForm({ title: '', slug: '', content: '', status: 'draft' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      postsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: postsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const startEdit = (post: Post) => {
    setEditing(post)
    setForm({ title: post.title, slug: post.slug, content: post.content, status: post.status as 'draft' | 'published' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadsApi.uploadImage(file)
      const markdown = `![${file.name}](${url})`
      const textarea = textareaRef.current
      if (textarea) {
        const { selectionStart, selectionEnd } = textarea
        const before = form.content.slice(0, selectionStart)
        const after = form.content.slice(selectionEnd)
        setForm({ ...form, content: `${before}${markdown}${after}` })
      } else {
        setForm({ ...form, content: form.content + '\n' + markdown })
      }
    } catch {
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <main className="container">
      <h1>ダッシュボード</h1>

      {/* 投稿フォーム */}
      <section className="form-card">
        <h2>{editing ? '記事を編集' : '新しい記事'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            タイトル
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            スラッグ（URL）
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="my-first-post"
              required
            />
          </label>
          <div className="editor-label">
            <span>本文（Markdown）</span>
            <button
              type="button"
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'アップロード中...' : '🖼 画像を挿入'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              placeholder={'## 見出し\n\n本文を書く...\n\n![alt](画像URLが自動挿入されます)'}
              required
            />
          </div>
          <label>
            ステータス
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? '更新' : '作成'}
            </button>
            {editing && (
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                キャンセル
              </button>
            )}
          </div>
        </form>
      </section>

      {/* 記事一覧 */}
      <section>
        <h2>記事一覧</h2>
        {isLoading && <div className="loading">読み込み中...</div>}
        <div className="post-list">
          {posts?.map((post) => (
            <div key={post.id} className="post-card post-card--manage">
              <div>
                <h3>{post.title}</h3>
                <span className={`badge badge--${post.status}`}>
                  {post.status === 'published' ? '公開' : '下書き'}
                </span>
              </div>
              <div className="post-actions">
                <button className="btn-secondary" onClick={() => startEdit(post)}>編集</button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm('削除しますか？')) deleteMutation.mutate(post.id)
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
