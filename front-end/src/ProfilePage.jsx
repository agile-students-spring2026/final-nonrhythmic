import { useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [info, setInfo] = useState(
    'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.'
  )

  const myListings = [
    {
      id: 1,
      name: 'NYC Apartment',
      location: 'Manhattan',
      price: '$1200/month',
    },
    {
      id: 2,
      name: 'Brooklyn Room',
      location: 'Brooklyn',
      price: '$900/month',
    },
  ]

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

          {myListings.map((listing) => (
            <Link
              to="/listing"
              className="card-link"
              key={listing.id}
            >
              <ListingCard
                name={listing.name}
                location={listing.location}
                price={listing.price}
              />
            </Link>
          ))}
        </div>

        <div className="bottom-nav">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/listings" className="nav-item">
            Subleases
          </Link>
          <Link to="/tenants" className="nav-item">
            Tenants
          </Link>
          <Link to="/add-listing" className="nav-item">
            Add listing
          </Link>
          <Link to="/profile" className="nav-item active-nav">
            Profile
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
