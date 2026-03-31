import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useListings } from './hooks/useListings'
import './ProfilePage.css'

function ProfilePage() {
  const { listings, loading } = useListings()
  const myListings = useMemo(() => listings.slice(0, 2), [listings])
  const [isEditing, setIsEditing] = useState(false)
  const [info, setInfo] = useState(
    'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
  )

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <header className="profile-top">
          <Link to="/" className="profile-back" aria-label="Back to home">
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
          <h1 className="profile-heading">My Profile</h1>
        </header>

        <div className="profile-body">
          <div className="profile-hero">
            <div className="profile-avatar" aria-hidden="true" />
            <h2 className="profile-username">Username</h2>
          </div>

          <section className="profile-section" aria-labelledby="profile-about-heading">
            <div className="profile-section-head">
              <h2 id="profile-about-heading" className="profile-section-title">
                About
              </h2>
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                className="profile-textarea"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
              />
            ) : (
              <div className="profile-info-box">{info}</div>
            )}
          </section>

          <section className="profile-section" aria-labelledby="profile-listings-heading">
            <h2 id="profile-listings-heading" className="profile-listings-title">
              My listings
            </h2>

            {loading ? (
              <p className="profile-listings-hint">Loading listings…</p>
            ) : myListings.length === 0 ? (
              <p className="profile-listings-hint">No listings yet.</p>
            ) : (
              <div className="profile-listings-stack">
                {myListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    variant="feed"
                    to={`/listing/${listing.id}`}
                    name={listing.name}
                    location={listing.location}
                    price={listing.price}
                    imageSeed={`subvet-${listing.id}`}
                    rating={listing.rating}
                    details={listing.details}
                    showFavorite={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <MainNav active="profile" />
      </div>
    </div>
  )
}

export default ProfilePage
