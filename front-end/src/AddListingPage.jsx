import { Link } from 'react-router-dom'
import MainNav from './MainNav'
import './AddListingPage.css'

function AddListingPage() {
  return (
    <div className="add-listing-page">
      <div className="add-listing-shell">
        <Link to="/" className="add-listing-back" aria-label="Home">
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
        <h1 className="add-listing-title">Add listing</h1>
        <p className="add-listing-text">Coming soon</p>
        <Link to="/" className="add-listing-cta">
          Back to home
        </Link>
        <MainNav active="add" />
      </div>
    </div>
  )
}

export default AddListingPage
