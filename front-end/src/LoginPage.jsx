import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MainNav from './MainNav'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Could not sign in right now.')
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
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
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
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </label>
          {error ? <p className="auth-status auth-status--error">{error}</p> : null}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
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
