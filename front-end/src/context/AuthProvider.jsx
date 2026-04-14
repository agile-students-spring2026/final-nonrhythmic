import { useEffect, useState } from 'react'
import { loginUser, registerUser } from '../api/auth'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'subvet.authUser'
const TOKEN_STORAGE_KEY = 'subvet.authToken'

function readStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function readStoredToken() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [token, setToken] = useState(() => readStoredToken())

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }, [token])

  async function login(credentials) {
    const data = await loginUser(credentials)
    setUser(data.user)
    setToken(data.token ?? null)
    return data.user
  }

  async function register(details) {
    const data = await registerUser(details)
    setUser(data.user)
    setToken(data.token ?? null)
    return data.user
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  function syncUserProfile(nextUser) {
    setUser((current) => {
      if (!current || current.id !== nextUser.id) return current
      return nextUser
    })
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    syncUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
