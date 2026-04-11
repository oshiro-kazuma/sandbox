import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">Blog</Link>
      <div className="nav-links">
        {user ? (
          <>
            {user.url_path
              ? <Link to={`/${user.url_path}`} className="nav-user">{user.username}</Link>
              : <span className="nav-user">{user.username}</span>
            }
            <Link to="/u/dashboard">ダッシュボード</Link>
            <Link to="/u/settings">設定</Link>
            <button onClick={handleLogout} className="btn-link">ログアウト</button>
          </>
        ) : (
          <Link to="/login">ログイン</Link>
        )}
      </div>
    </nav>
  )
}
