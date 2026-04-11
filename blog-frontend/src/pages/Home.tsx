import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { postsApi } from '../api'

export function Home() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: postsApi.list,
  })

  if (isLoading) return <div className="loading">読み込み中...</div>
  if (error) return <div className="error">エラーが発生しました</div>

  return (
    <main className="container">
      <h1>記事一覧</h1>
      {posts?.length === 0 && <p className="empty">まだ記事がありません</p>}
      <div className="post-list">
        {posts?.map((post) => (
          <article key={post.id} className="post-card">
            <h2>
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p className="post-meta">
              {new Date(post.created_at).toLocaleDateString('ja-JP')}
            </p>
            <p className="post-excerpt">
              {post.content.slice(0, 120)}
              {post.content.length > 120 && '…'}
            </p>
            <Link to={`/posts/${post.id}`} className="read-more">続きを読む →</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
