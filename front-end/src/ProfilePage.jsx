import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUserById, updateUserById } from './api/users'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import { useListings } from './hooks/useListings'
import './ProfilePage.css'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, syncUserProfile } = useAuth()
  const { listings, loading } = useListings()
  const activeUserId = user?.id ?? 'demo'
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => {
    let cancelled = false
    setProfileLoading(true)
    setProfileError('')

    getUserById(activeUserId)
      .then((nextProfile) => {
        if (cancelled) return
        setProfile(nextProfile)
        setDraftName(nextProfile.name)
        setDraftBio(nextProfile.bio)
      })
      .catch((err) => {
        if (cancelled) return
        setProfileError(err.message || 'Could not load your profile right now.')
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeUserId])

  const profileName = profile?.name ?? user?.name ?? 'Kaiyuan Wu'
  const profileEmail = profile?.email ?? user?.email ?? 'demo@subvet.app'
  const profileAvatarSeed = profile?.avatarSeed ?? profileName
  const profileId = profile?.id ?? user?.id ?? null

  const myListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          (profileId && listing.ownerId === profileId) ||
          (!listing.ownerId && listing.owner === profileName),
      ),
    [listings, profileId, profileName],
  )

  function handleStartEdit() {
    if (!user) {
      navigate('/login')
      return
    }

    setSaveStatus('')
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setDraftName(profile?.name ?? '')
    setDraftBio(profile?.bio ?? '')
    setSaveStatus('')
    setIsEditing(false)
  }

  async function handleSaveProfile() {
    if (!user || !profile) {
      navigate('/login')
      return
    }

    setSaving(true)
    setSaveStatus('')

    try {
      const updated = await updateUserById(profile.id, {
        name: draftName,
        bio: draftBio,
      })
      setProfile(updated)
      setDraftName(updated.name)
      setDraftBio(updated.bio)
      syncUserProfile(updated)
      setSaveStatus('Profile updated.')
      setIsEditing(false)
    } catch (err) {
      setSaveStatus(err.message || 'Could not update your profile right now.')
    } finally {
      setSaving(false)
    }
  }

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
            <div className="profile-avatar">
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(profileAvatarSeed)}/120/120`}
                alt=""
                width={120}
                height={120}
              />
            </div>
            {profileLoading ? (
              <p className="profile-state">Loading profile…</p>
            ) : profileError ? (
              <p className="profile-state profile-state--error">{profileError}</p>
            ) : (
              <>
                <h2 className="profile-username">{profileName}</h2>
                <p className="profile-email">{profileEmail}</p>
                {user ? (
                  <button type="button" className="profile-session-btn" onClick={logout}>
                    Sign out
                  </button>
                ) : (
                  <p className="profile-hint">Sign in to edit your profile and save listings.</p>
                )}
              </>
            )}
          </div>

          <section className="profile-section" aria-labelledby="profile-about-heading">
            <div className="profile-section-head">
              <h2 id="profile-about-heading" className="profile-section-title">
                About
              </h2>
              {isEditing ? (
                <div className="profile-action-row">
                  <button
                    type="button"
                    className="profile-edit-btn"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="profile-save-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <button type="button" className="profile-edit-btn" onClick={handleStartEdit}>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="profile-form">
                <label className="profile-field">
                  <span className="profile-label">Display name</span>
                  <input
                    className="profile-input"
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    disabled={saving}
                  />
                </label>
                <label className="profile-field">
                  <span className="profile-label">About</span>
                  <textarea
                    className="profile-textarea"
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    disabled={saving}
                  />
                </label>
              </div>
            ) : (
              <div className="profile-info-box">{profile?.bio ?? 'No profile information yet.'}</div>
            )}

            {saveStatus ? (
              <p
                className={
                  saveStatus === 'Profile updated.'
                    ? 'profile-status'
                    : 'profile-status profile-status--error'
                }
              >
                {saveStatus}
              </p>
            ) : null}
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
