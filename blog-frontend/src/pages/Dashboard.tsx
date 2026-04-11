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
  const [form, setForm] = useState<{ title: string; slug: string; content: string; status: 'draft' | 'published' }>({
    title: '', slug: '', content: '', status: 'draft',
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: postsApi.listAll,
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
      setForm({ title: '', slug: '', content: '', status: 'draft' })
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ title: '', slug: '', content: '', status: 'draft' })
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

  const isBusy = createMutation.isPending || updateMutation.isPending

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: '2rem' }}>ダッシュボード</h1>

      <div className="dashboard-grid">
        {/* ─ Editor panel ─ */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>{editing ? `編集中：${editing.title}` : '新しい記事'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
                タイトル
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="記事タイトル"
                  required
                />
              </label>
              <label>
                スラッグ
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="my-first-post"
                  required
                />
              </label>
            </div>

            <div className="editor-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>本文 <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(Markdown)</span></span>
                <button
                  type="button"
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'アップロード中…' : '🖼 画像を挿入'}
                </button>
              </div>
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
                rows={14}
                placeholder={'## 見出し\n\n本文を書く…'}
                required
                style={{ fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: '0.875rem', lineHeight: '1.6' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600 }}>ステータス</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
                  style={{ width: 'auto' }}
                >
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                </select>
              </label>
              <div className="form-actions">
                {editing && (
                  <button type="button" className="btn-secondary" onClick={cancelEdit}>
                    キャンセル
                  </button>
                )}
                <button type="submit" disabled={isBusy}>
                  {isBusy ? '保存中…' : editing ? '更新する' : '作成する'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ─ Posts list ─ */}
        <section className="panel" style={{ gridColumn: '1 / -1' }}>
          <h2>記事一覧</h2>
          {isLoading && <div className="loading" style={{ padding: '2rem' }}>読み込み中…</div>}
          {posts?.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', padding: '1rem 0' }}>まだ記事がありません</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {posts?.map((post) => (
              <div key={post.id} className="post-card--manage" style={{ padding: '0.9rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span className={`badge badge--${post.status}`}>
                      {post.status === 'published' ? '公開' : '下書き'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>
                      {new Date(post.updated_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
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
      </div>
    </div>
  )
}
