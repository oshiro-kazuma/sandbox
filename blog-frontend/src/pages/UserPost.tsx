import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { profilesApi } from '../api'

export function UserPost() {
  const { handle, slug } = useParams<{ handle: string; slug: string }>()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['userPost', handle, slug],
    queryFn: () => profilesApi.getPost(handle!, slug!),
    enabled: !!handle && !!slug,
  })

  if (isLoading) return <div className="loading">読み込み中...</div>
  if (error) return <div className="error">記事が見つかりませんでした</div>
  if (!post) return null

  return (
    <main className="container">
      <Link to={`/u/${handle}`} className="back-link">← {handle} の記事一覧</Link>
      <article className="post-detail">
        <header>
          <h1>{post.title}</h1>
          <p className="post-meta">
            {new Date(post.created_at).toLocaleDateString('ja-JP')}
          </p>
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
