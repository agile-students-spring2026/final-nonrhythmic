import { Link } from 'react-router-dom'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import './HomePage.css'

function HomePage() {
  const { user } = useAuth()
  return (
    <div className="home-page">
      <div className="home-shell">
        <header className="home-header">
          <h1 className="home-title">SubVet</h1>
          <p className="home-tagline">
            Subleases and intern housing—browse places or find roommates for the summer.
          </p>
          <div className="home-auth">
            {user ? (
              <>
                <span className="home-auth-greeting">Hi, {user.name}</span>
                <Link to="/profile" className="home-auth-link home-auth-link--primary">
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="home-auth-link">
                  Sign in
                </Link>
                <Link to="/register" className="home-auth-link home-auth-link--primary">
                  Create account
                </Link>
              </>
            )}
          </div>
        </header>

        <nav className="home-nav" aria-label="Main">
          <Link to="/listings" className="home-tile">
            <svg className="home-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="home-tile-label">Find subleases</span>
            <span className="home-tile-desc">Search listings, filters, and saved favorites</span>
          </Link>
          <Link to="/tenants" className="home-tile">
            <svg className="home-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M2 21v-1a5 5 0 0110 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M22 21v-1a4 4 0 00-5-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="home-tile-label">Find intern tenants</span>
            <span className="home-tile-desc">Students looking for a summer spot or roommate match</span>
          </Link>
          <Link to="/saved" className="home-tile">
            <svg className="home-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="home-tile-label">Saved listings</span>
            <span className="home-tile-desc">Your favorited subleases in one place</span>
          </Link>
          <Link to="/profile" className="home-tile">
            <svg className="home-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 21v-1a7 7 0 0114 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="home-tile-label">My profile</span>
            <span className="home-tile-desc">Bio and your posted listings</span>
          </Link>
          <Link to="/add-listing" className="home-tile home-tile--muted">
            <svg className="home-tile-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="home-tile-label">Add listing</span>
            <span className="home-tile-desc">Post a sublease or a tenant application</span>
          </Link>
        </nav>
        <MainNav active="home" />
      </div>
    </div>
  )
}

export default HomePage
