import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserById, updateUserById } from './api/users'
import ListingCard from './ListingCard'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import { useListings } from './hooks/useListings'
import './ProfilePage.css'
import { getUserApplications } from './api/applications'
import { getNotifications, markNotificationRead } from './api/notifications'

function ProfilePage() {
  const { user, logout, syncUserProfile } = useAuth()
  const { listings, loading } = useListings()
  const activeUserId = user?.id

  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [appliedListings, setAppliedListings] = useState([])
  const [appliedLoading, setAppliedLoading] = useState(false)
  const [appliedError, setAppliedError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!activeUserId) {
      setProfileLoading(false)
      setProfile(null)
      setProfileError('')
      return () => {
        cancelled = true
      }
    }

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

  useEffect(() => {
    if (!user || !activeUserId) {
      setAppliedListings([])
      return
    }

    let cancelled = false
    setAppliedLoading(true)
    setAppliedError('')

    getUserApplications(activeUserId)
      .then((listings) => {
        if (cancelled) return
        setAppliedListings(listings ?? [])
      })
      .catch((err) => {
        if (cancelled) return
        setAppliedError(err.message || 'Could not load applied listings right now.')
      })
      .finally(() => {
        if (!cancelled) setAppliedLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, activeUserId])

  useEffect(() => {
    if (!activeUserId) return

    let cancelled = false
    setNotifLoading(true)

    getNotifications(activeUserId)
      .then((data) => {
        if (!cancelled) setNotifications(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setNotifications([])
      })
      .finally(() => {
        if (!cancelled) setNotifLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeUserId])

  const profileName = profile?.name ?? user?.name ?? ''
  const profileEmail = profile?.email ?? user?.email ?? ''
  const profileAvatarSeed = profile?.avatarSeed ?? (profileName || user?.name || 'member')
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
    if (!profile) {
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

  async function handleMarkNotificationRead(notificationId) {
    if (!activeUserId) return
    try {
      await markNotificationRead(activeUserId, notificationId)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      )
    } catch {
      /* ignore */
    }
  }

  function describeNotification(n) {
    const name = n.fromUserName || 'Someone'
    const email = n.fromEmail || ''
    if (n.kind === 'listing_contact') {
      return `${name} (${email}) contacted you about “${n.listingName || 'a listing'}”.`
    }
    if (n.kind === 'listing_application') {
      return `${name} (${email}) applied to “${n.listingName || 'your listing'}”.`
    }
    if (n.kind === 'tenant_contact') {
      return `${name} (${email}) contacted you about tenant profile “${n.tenantName || n.tenantId || 'profile'}”.`
    }
    return `${name} (${email}) sent you an update.`
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
                <h2 className="profile-username">{profileName || 'Your profile'}</h2>
                <p className="profile-email">{profileEmail}</p>
                <button type="button" className="profile-session-btn" onClick={logout}>
                  Sign out
                </button>
              </>
            )}
          </div>

          <section className="profile-section" aria-labelledby="profile-notify-heading">
            <h2 id="profile-notify-heading" className="profile-section-title">
              Notifications
            </h2>
            <p className="profile-notify-lead">
              When someone contacts or applies about your listing, their name and email appear here so you can reach out.
            </p>
            {notifLoading ? (
              <p className="profile-listings-hint">Loading notifications…</p>
            ) : notifications.length === 0 ? (
              <p className="profile-listings-hint">No notifications yet.</p>
            ) : (
              <ul className="profile-notify-list">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={
                      n.read ? 'profile-notify-item' : 'profile-notify-item profile-notify-item--new'
                    }
                  >
                    <p className="profile-notify-text">{describeNotification(n)}</p>
                    {!n.read ? (
                      <button
                        type="button"
                        className="profile-notify-read"
                        onClick={() => handleMarkNotificationRead(n.id)}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

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
              Created listings
            </h2>

            {loading ? (
              <p className="profile-listings-hint">Loading listings…</p>
            ) : myListings.length === 0 ? (
              <p className="profile-listings-hint">No created listings yet.</p>
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
          <section className="profile-section" aria-labelledby="profile-applied-listings-heading">
            <h2 id="profile-applied-listings-heading" className="profile-listings-title">
              Applied listings
            </h2>

            {appliedLoading ? (
              <p className="profile-listings-hint">Loading applied listings…</p>
            ) : appliedError ? (
              <p className="profile-listings-hint">{appliedError}</p>
            ) : appliedListings.length === 0 ? (
              <p className="profile-listings-hint">No applied listings yet.</p>
            ) : (
              <div className="profile-listings-stack">
                {appliedListings.map((listing) => (
                  <div className="profile-applied-card" key={listing.id}>
                    <div className="profile-application-status">
                      <span className="profile-status-badge">Submitted</span>
                      <span className="profile-status-text">Stored in SubVet — no in-app messaging yet</span>
                    </div>

                    <ListingCard
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
                  </div>
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
