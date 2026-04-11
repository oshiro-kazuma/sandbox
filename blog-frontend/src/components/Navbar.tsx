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
            <span className="nav-user">{user.username}</span>
            <Link to="/dashboard">ダッシュボード</Link>
            <button onClick={handleLogout} className="btn-link">ログアウト</button>
          </>
        ) : (
          <Link to="/login">ログイン</Link>
        )}
      </div>
    </nav>
  )
}
