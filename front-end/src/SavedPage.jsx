import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import { useListings } from './hooks/useListings'
import { buildLoginUrl } from './utils/authRedirect'
import './SavedPage.css'

function SavedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { listings, loading, savedIds, toggleSaved } = useListings()

  const savedListings = useMemo(
    () => listings.filter((l) => savedIds.includes(l.id)),
    [listings, savedIds],
  )

  return (
    <div className="saved-page">
      <div className="saved-shell">
        <header className="saved-top">
          <Link to="/" className="saved-back" aria-label="Back to home">
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
          <h1 className="saved-heading">Saved listings</h1>
        </header>

        <div className="saved-feed" role="list">
          {loading ? (
            <p className="saved-status" role="status">Loading…</p>
          ) : savedListings.length === 0 ? (
            <div className="saved-empty">
              {!user ? (
                <>
                  <p className="saved-empty-text">Sign in to save listings and sync them to your account.</p>
                  <Link to={buildLoginUrl('/saved')} className="saved-empty-link">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <p className="saved-empty-text">No saved listings yet.</p>
                  <Link to="/listings" className="saved-empty-link">
                    Browse subleases
                  </Link>
                </>
              )}
            </div>
          ) : (
            savedListings.map((listing) => (
              <div key={listing.id} role="listitem">
                <ListingCard
                  variant="feed"
                  to={`/listing/${listing.id}`}
                  imageSeed={`subvet-${listing.id}`}
                  name={listing.name}
                  location={listing.location}
                  price={listing.price}
                  rating={listing.rating}
                  details={listing.details}
                  saved={savedIds.includes(listing.id)}
                  onFavoriteToggle={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!user) {
                      navigate(buildLoginUrl(location.pathname))
                      return
                    }
                    await toggleSaved(listing.id)
                  }}
                  />
              </div>
            ))
          )}
        </div>

        <MainNav />
      </div>
    </div>
  )
}

export default SavedPage
