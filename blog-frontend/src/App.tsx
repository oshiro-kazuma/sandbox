import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/auth'
import { Navbar } from './components/Navbar'
import { Profile } from './pages/Profile'
import { UserPost } from './pages/UserPost'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'

const queryClient = new QueryClient()

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/u/dashboard' : '/login'} replace />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* root */}
            <Route path="/" element={<RootRedirect />} />
            {/* auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* authenticated — /u/* 配下 */}
            <Route path="/u/dashboard" element={<Dashboard />} />
            <Route path="/u/settings" element={<Settings />} />
            {/* public — /:handle 配下 */}
            <Route path="/:handle" element={<Profile />} />
            <Route path="/:handle/posts/:slug" element={<UserPost />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
