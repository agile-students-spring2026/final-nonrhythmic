import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useListings } from './hooks/useListings'

function ProfilePage() {
  const { listings, loading } = useListings()
  const myListings = useMemo(() => listings.slice(0, 2), [listings])
  const [isEditing, setIsEditing] = useState(false)
  const [info, setInfo] = useState(
    'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
  )

  return (
    <div className="page">
      <div className="phone-frame">
        <div className="profile-top-bar">
          <Link to="/" className="profile-back-btn" aria-label="Back to home">
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
          <h1 className="title profile-page-title">My Profile</h1>
        </div>

        <div className="profile-header">
          <h3 className="profile-username">Username</h3>
          <div className="profile-picture">Profile Picture</div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <span>Edit</span>
            <button
              className="edit-btn"
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
        </div>

        <div className="profile-section">
          <h3 className="my-listing-title">My Listings</h3>

          {loading ? (
            <p className="profile-listings-hint">Loading listings…</p>
          ) : myListings.length === 0 ? (
            <p className="profile-listings-hint">No listings yet.</p>
          ) : (
            myListings.map((listing) => (
              <Link
                to={`/listing/${listing.id}`}
                className="card-link"
                key={listing.id}
              >
                <ListingCard
                  name={listing.name}
                  location={listing.location}
                  price={listing.price}
                  imageSeed={`subvet-${listing.id}`}
                />
              </Link>
            ))
          )}
        </div>

        <MainNav active="profile" />
      </div>
    </div>
  )
}

export default ProfilePage
