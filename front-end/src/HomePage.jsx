import { Link } from 'react-router-dom'
import MainNav from './MainNav'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <div className="home-shell">
        <header className="home-header">
          <h1 className="home-title">SubVet</h1>
          <p className="home-tagline">
            Subleases and intern housing—browse places or find roommates for the summer.
          </p>
          <div className="home-auth">
            <Link to="/login" className="home-auth-link">
              Sign in
            </Link>
            <Link to="/register" className="home-auth-link home-auth-link--primary">
              Create account
            </Link>
          </div>
        </header>

        <nav className="home-nav" aria-label="Main">
          <Link to="/listings" className="home-tile">
            <span className="home-tile-label">Find subleases</span>
            <span className="home-tile-desc">Search listings, filters, and saved favorites</span>
          </Link>
          <Link to="/tenants" className="home-tile">
            <span className="home-tile-label">Find intern tenants</span>
            <span className="home-tile-desc">Students looking for a summer spot or roommate match</span>
          </Link>
          <Link to="/profile" className="home-tile">
            <span className="home-tile-label">My profile</span>
            <span className="home-tile-desc">Bio and your posted listings</span>
          </Link>
          <Link to="/add-listing" className="home-tile home-tile--muted">
            <span className="home-tile-label">Add listing</span>
            <span className="home-tile-desc">Coming soon</span>
          </Link>
        </nav>
        <MainNav active="home" />
      </div>
    </div>
  )
}

export default HomePage
