import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../lib/auth'
import { validateUrlPath, deriveUrlPath } from '../lib/validateUrlPath'

export function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', url_path: '' })
  const [urlPathTouched, setUrlPathTouched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const urlPathError = urlPathTouched ? validateUrlPath(form.url_path) : null

  const handleUsernameChange = (value: string) => {
    setForm((f) => ({
      ...f,
      username: value,
      url_path: urlPathTouched ? f.url_path : deriveUrlPath(value),
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setUrlPathTouched(true)
    const pathErr = validateUrlPath(form.url_path)
    if (pathErr) return
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      const res = await authApi.login({ email: form.email, password: form.password })
      login(res.token, res.user)
      navigate('/u/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('409') || msg.includes('重複')) {
        setError('ユーザー名・メール・URL パスのいずれかが既に使われています')
      } else {
        setError('登録に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <div className="form-card">
        <h1>新規登録</h1>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            ユーザー名
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            メールアドレス
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            パスワード（8文字以上）
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </label>
          <label>
            あなたの URL パス
            <input
              type="text"
              value={form.url_path}
              onChange={(e) => {
                setUrlPathTouched(true)
                setForm({ ...form, url_path: e.target.value.toLowerCase() })
              }}
              placeholder="alice"
              required
            />
            {form.url_path && !urlPathError && (
              <span className="url-preview">→ /u/{form.url_path}</span>
            )}
            {urlPathError && <span className="form-error">{urlPathError}</span>}
            <small>英字始まり・英小文字/数字/ハイフン/アンダースコア・3〜30文字</small>
          </label>
          <button type="submit" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        <p className="form-footer">
          すでにアカウントがある場合は <Link to="/login">ログイン</Link>
        </p>
      </div>
    </main>
  )
}
