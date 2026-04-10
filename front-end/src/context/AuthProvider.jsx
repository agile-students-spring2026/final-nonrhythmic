import { useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../api/auth'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'subvet.authUser'

function readStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  async function login(credentials) {
    const data = await loginUser(credentials)
    setUser(data.user)
    return data.user
  }

  async function register(details) {
    const data = await registerUser(details)
    setUser(data.user)
    return data.user
  }

  function logout() {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
