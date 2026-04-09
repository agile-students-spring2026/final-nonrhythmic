import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import MainNav from './MainNav'
import './AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Could not create your account right now.')
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
            <input
              className="auth-input"
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
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
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              required
            />
          </label>
          {error ? <p className="auth-status auth-status--error">{error}</p> : null}
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
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
