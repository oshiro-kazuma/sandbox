import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserResponse } from '../api/types'

type AuthState = {
  user: UserResponse | null
  token: string | null
}

type AuthContextType = AuthState & {
  login: (token: string, user: UserResponse) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')
    const user = raw ? (JSON.parse(raw) as UserResponse) : null
    return { token, user }
  })

  const login = (token: string, user: UserResponse) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setState({ token, user })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setState({ token: null, user: null })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
