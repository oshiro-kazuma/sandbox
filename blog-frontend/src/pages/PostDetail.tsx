import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { postsApi } from '../api'

export function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => postsApi.get(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="loading">読み込み中…</div>
  if (error) return <div className="error">記事が見つかりませんでした</div>
  if (!post) return null

  return (
    <main className="container">
      <Link to="/" className="back-link">← 一覧に戻る</Link>
      <article className="post-detail">
        <header>
          <p className="post-meta">
            {new Date(post.created_at).toLocaleDateString('ja-JP', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
            {post.status === 'draft' && <span className="badge-draft">下書き</span>}
          </p>
          <h1>{post.title}</h1>
        </header>
        <div className="post-content markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
