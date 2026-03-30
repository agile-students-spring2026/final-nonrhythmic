import { Link } from 'react-router-dom'
import MainNav from './MainNav'
import './AuthPage.css'

function RegisterPage() {
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

        <p className="auth-lead">
          This is a UI placeholder for sprint 1. Registration will be wired to the back-end in a
          later sprint.
        </p>

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <label className="auth-field">
            <span className="auth-label">Display name</span>
            <input className="auth-input" type="text" name="name" placeholder="Your name" />
          </label>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@school.edu"
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
            />
          </label>
          <button type="submit" className="auth-submit">
            Create account
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

