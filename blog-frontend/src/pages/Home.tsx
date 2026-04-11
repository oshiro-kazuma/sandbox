import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { postsApi } from '../api'

export function Home() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.list,
  })

  if (isLoading) return <div className="loading">読み込み中…</div>
  if (error) return <div className="error">エラーが発生しました</div>

  return (
    <main className="container">
      <h1>記事</h1>
      {posts?.length === 0 && (
        <p className="empty">まだ記事がありません</p>
      )}
      <div className="post-list">
        {posts?.map((post) => (
          <article key={post.id} className="post-card">
            <p className="post-meta">
              {new Date(post.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <h2>{post.title}</h2>
            <div className="post-content markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
