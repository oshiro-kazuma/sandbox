import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { postsApi } from '../api'
import { useAuth } from '../lib/auth'

const PAGE_SIZE = 20

const imgComponent = {
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img
      src={src?.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL ?? ''}${src}` : src}
      alt={alt}
    />
  ),
}

export function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.list,
  })

  if (isLoading) return <div className="loading">読み込み中…</div>
  if (error) return <div className="error">エラーが発生しました</div>

  const getPostDate = (slug: string, createdAt: string) => {
    const m = slug.match(/^(\d{4}-\d{2}-\d{2})/)
    return m ? new Date(m[1]).getTime() : new Date(createdAt).getTime()
  }
  const sorted = [...(posts ?? [])].sort(
    (a, b) => getPostDate(b.slug, b.created_at) - getPostDate(a.slug, a.created_at)
  )
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="container">
      {sorted.length === 0 && (
        <p className="empty">まだ記事がありません</p>
      )}
      <div className="feed">
        {paged.map((post) => (
          <article key={post.id} className="feed-item">
            <time className="feed-date">
              {new Date(post.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <h2 className="feed-title">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h2>
              {user && (
                <button
                  onClick={() => navigate('/dashboard', { state: { editId: post.id } })}
                  style={{
                    flexShrink: 0,
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-strong)',
                    background: 'transparent',
                    color: 'var(--text-3)',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                  }}
                >
                  編集
                </button>
              )}
            </div>
            <div className="feed-excerpt markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={imgComponent}>
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-strong)',
              background: page === 1 ? 'transparent' : 'var(--surface)',
              color: page === 1 ? 'var(--text-3)' : 'var(--text)',
              cursor: page === 1 ? 'default' : 'pointer',
            }}
          >
            ← 前へ
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border-strong)',
              background: page === totalPages ? 'transparent' : 'var(--surface)',
              color: page === totalPages ? 'var(--text-3)' : 'var(--text)',
              cursor: page === totalPages ? 'default' : 'pointer',
            }}
          >
            次へ →
          </button>
        </div>
      )}
    </main>
  )
}
