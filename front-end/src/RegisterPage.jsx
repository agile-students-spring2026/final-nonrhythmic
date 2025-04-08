import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from './apiBase'
import MainNav from './MainNav'
import './AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const data = new FormData(e.currentTarget)
    const password = data.get('password')
    const confirm = data.get('confirmPassword')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          password,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Error ${res.status}`)
      }
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Could not create account.')
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
          <h1 className="auth-title">Create account</h1>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Display name</span>
            <input className="auth-input" type="text" name="name" placeholder="Your name" required />
          </label>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Confirm password</span>
            <input
              className="auth-input"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter password"
              required
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>

        <MainNav />
      </div>
    </div>
  )
}

export default RegisterPage
