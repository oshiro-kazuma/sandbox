import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
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
      {posts?.length === 0 && (
        <p className="empty">まだ記事がありません</p>
      )}
      <div className="feed">
        {posts?.map((post) => (
          <article key={post.id} className="feed-item">
            <time className="feed-date">
              {new Date(post.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <h2 className="feed-title">
              <Link to={`/posts/${post.id}`}>{post.title}</Link>
            </h2>
            <p className="feed-excerpt">
              {post.content.slice(0, 160)}{post.content.length > 160 && '…'}
            </p>
            <Link to={`/posts/${post.id}`} className="feed-more">
              続きを読む →
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}
