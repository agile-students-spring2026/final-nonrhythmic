import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from './apiBase'
import MainNav from './MainNav'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const data = new FormData(e.currentTarget)
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <header className="auth-top">
          <Link to="/" className="auth-back" aria-label="Home">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1 className="auth-title">Sign in</h1>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@school.edu"
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          No account?{' '}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>

        <MainNav />
      </div>
    </div>
  )
}

export default LoginPage
