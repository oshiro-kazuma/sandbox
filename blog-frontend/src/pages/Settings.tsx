import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api'
import { useAuth } from '../lib/auth'
import { validateUrlPath } from '../lib/validateUrlPath'

export function Settings() {
  const { user, login, token } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [urlPath, setUrlPath] = useState(user?.url_path ?? '')
  const [urlPathTouched, setUrlPathTouched] = useState(false)
  const [success, setSuccess] = useState(false)

  const urlPathError = urlPathTouched ? validateUrlPath(urlPath) : null

  const mutation = useMutation({
    mutationFn: () => usersApi.updateProfile({ url_path: urlPath }),
    onSuccess: (updated) => {
      login(token!, updated)
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setSuccess(true)
    },
  })

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setUrlPathTouched(true)
    if (validateUrlPath(urlPath)) return
    setSuccess(false)
    mutation.mutate()
  }

  return (
    <main className="container">
      <div className="form-card">
        <h1>プロフィール設定</h1>

        {success && (
          <p className="form-success">
            更新しました →{' '}
            <a href={`/u/${urlPath}`}>/u/{urlPath}</a>
          </p>
        )}
        {mutation.isError && (
          <p className="form-error">
            {(mutation.error as Error)?.message?.includes('409')
              ? 'この URL パスはすでに使われています'
              : '更新に失敗しました'}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            ユーザー名
            <input type="text" value={user.username} disabled />
          </label>
          <label>
            メールアドレス
            <input type="email" value={user.email} disabled />
          </label>
          <label>
            URL パス
            <input
              type="text"
              value={urlPath}
              onChange={(e) => {
                setUrlPathTouched(true)
                setSuccess(false)
                setUrlPath(e.target.value.toLowerCase())
              }}
              placeholder="alice"
              required
            />
            {urlPath && !urlPathError && (
              <span className="url-preview">→ /u/{urlPath}</span>
            )}
            {urlPathError && <span className="form-error">{urlPathError}</span>}
            <small>英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字</small>
          </label>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? '更新中...' : '保存'}
          </button>
        </form>
      </div>
    </main>
  )
}
