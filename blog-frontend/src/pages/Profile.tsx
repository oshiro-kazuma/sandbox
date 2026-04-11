import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { profilesApi } from '../api'

export function Profile() {
  const { urlPath } = useParams<{ urlPath: string }>()
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', urlPath],
    queryFn: () => profilesApi.get(urlPath!),
    enabled: !!urlPath,
  })

  if (isLoading) return <div className="loading">読み込み中...</div>
  if (error) return <div className="error">ユーザーが見つかりませんでした</div>
  if (!profile) return null

  return (
    <main className="container">
      <div className="profile-header">
        <h1>{profile.username}</h1>
        <p className="profile-url">/u/{profile.url_path}</p>
      </div>

      <section>
        <h2>投稿一覧</h2>
        {profile.posts.length === 0 && <p className="empty">まだ公開記事がありません</p>}
        <div className="post-list">
          {profile.posts.map((post) => (
            <article key={post.id} className="post-card">
              <h3>
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
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
      </section>
    </main>
  )
}
