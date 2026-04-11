import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuth } from '../lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res.token, res.user)
      navigate('/dashboard')
    } catch {
      setError('メールアドレスまたはパスワードが違います')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="form-card">
        <h1>ログイン</h1>
        <p className="form-note">このブログは管理者のみ利用できます</p>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            メールアドレス
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}
