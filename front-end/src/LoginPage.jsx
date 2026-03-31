import { Link } from 'react-router-dom'
import MainNav from './MainNav'
import './AuthPage.css'

function LoginPage() {
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

        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              className="auth-input"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="you@school.edu"
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
            />
          </label>
          <button type="submit" className="auth-submit">
            Sign in
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

