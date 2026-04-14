// import { useMemo, useState } from 'react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import { useListings } from './hooks/useListings'
import './SavedPage.css'

function SavedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // const { listings, loading } = useListings()
  const { listings, loading, savedIds, toggleSaved } = useListings()

  // Seed some mock saved IDs so the page isn't empty on first visit
  // const [savedIds, setSavedIds] = useState(() => new Set([1, 3, 5]))

  // const savedListings = useMemo(
  //   () => listings.filter((l) => savedIds.has(l.id)),
  //   [listings, savedIds],
  // ) 

  const savedListings = useMemo(
  () => listings.filter((l) => savedIds.includes(l.id)),
  [listings, savedIds],
  )

  

  // function toggleSaved(id) {
  //   setSavedIds((prev) => {
  //     const next = new Set(prev)
  //     if (next.has(id)) next.delete(id)
  //     else next.add(id)
  //     return next
  //   })
  // }

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
              <p className="saved-empty-text">No saved listings yet.</p>
              <Link to="/listings" className="saved-empty-link">Browse subleases</Link>
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
                  // saved={savedIds.has(listing.id)}
                  // onFavoriteToggle={() => toggleSaved(listing.id)}
                  saved={savedIds.includes(listing.id)}
                  onFavoriteToggle={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!user) {
                      navigate('/login')
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
