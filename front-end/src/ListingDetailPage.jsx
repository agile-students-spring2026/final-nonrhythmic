import { useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductById } from './api/fetchProductById'
import MainNav from './MainNav'
import './ListingDetailPage.css'

function ListingDetailPage() {
  const { id } = useParams()
  return <ListingDetailInner key={id} id={id} />
}

function ListingDetailInner({ id }) {
  const [listing, setListing] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [mapPickerOpen, setMapPickerOpen] = useState(false)
  const mapTitleId = useId()
  const mapPrimaryActionRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetchProductById(id)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setLoadError('Listing not found.')
          setListing(null)
        } else {
          setListing(data)
          setLoadError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load this listing.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!mapPickerOpen) return
    mapPrimaryActionRef.current?.focus()
    function onKey(e) {
      if (e.key === 'Escape') setMapPickerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mapPickerOpen])

  function openMaps(provider) {
    const q = encodeURIComponent(listing?.mapQuery ?? 'New York, NY')
    const url =
      provider === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${q}`
        : `https://maps.apple.com/?q=${q}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setMapPickerOpen(false)
  }

  if (loading) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-shell listing-detail-shell--center">
          <p className="listing-detail-status">Loading…</p>
          <MainNav active="listings" />
        </div>
      </div>
    )
  }

  if (loadError || !listing) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-shell listing-detail-shell--center">
          <p className="listing-detail-status">{loadError || 'Not found.'}</p>
          <Link to="/listings" className="listing-detail-back-inline">
            ← Back to listings
          </Link>
          <MainNav active="listings" />
        </div>
      </div>
    )
  }

  const reviewCount = 12 + (listing.id % 40)

  return (
    <div className="listing-detail-page">
      <article className="listing-detail-shell">
        <div className="listing-detail-hero">
          <Link to="/listings" className="listing-detail-back" aria-label="Back to listings">
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
          <img
            src={`https://picsum.photos/seed/subvet-detail-${listing.id}/960/600`}
            alt=""
            width={960}
            height={600}
          />
        </div>

        <div className="listing-detail-body">
          <div className="listing-detail-header">
            <h1 className="listing-detail-title">{listing.name}</h1>
            <button
              type="button"
              className="listing-detail-map-link listing-detail-map-trigger"
              onClick={() => setMapPickerOpen(true)}
            >
              Show map
            </button>
          </div>

          <p className="listing-detail-rating">
            ★ {listing.rating} · {reviewCount} reviews
          </p>
          <p className="listing-detail-location">
            {listing.location} · {listing.details}
          </p>

          <p
            className={
              descriptionExpanded
                ? 'listing-detail-description listing-detail-description--expanded'
                : 'listing-detail-description listing-detail-description--clamped'
            }
          >
            {listing.description}
          </p>

          <button
            type="button"
            className="listing-detail-read-more"
            onClick={() => setDescriptionExpanded((v) => !v)}
            aria-expanded={descriptionExpanded}
          >
            {descriptionExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        <footer className="listing-detail-footer">
          <div className="listing-detail-price-block">
            <p className="listing-detail-price-label">Price</p>
            <p className="listing-detail-price-value">{listing.price}</p>
          </div>
          <div className="listing-detail-actions">
            <button type="button" className="listing-detail-btn listing-detail-btn--ghost">
              Contact
            </button>
            <button type="button" className="listing-detail-btn listing-detail-btn--primary">
              Apply now
            </button>
          </div>
        </footer>
        <MainNav active="listings" />
      </article>

      {mapPickerOpen ? (
        <div
          className="listing-detail-map-overlay"
          role="presentation"
          onClick={() => setMapPickerOpen(false)}
        >
          <div
            className="listing-detail-map-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={mapTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={mapTitleId} className="listing-detail-map-dialog-title">
              Open in Maps
            </h2>
            <p className="listing-detail-map-dialog-text">
              Choose where to open this location. Your device or browser may ask before leaving
              this site or opening the maps app.
            </p>
            <div className="listing-detail-map-dialog-actions">
              <button
                ref={mapPrimaryActionRef}
                type="button"
                className="listing-detail-btn listing-detail-btn--ghost listing-detail-map-choice"
                onClick={() => openMaps('google')}
              >
                Google Maps
              </button>
              <button
                type="button"
                className="listing-detail-btn listing-detail-btn--primary listing-detail-map-choice"
                onClick={() => openMaps('apple')}
              >
                Apple Maps
              </button>
            </div>
            <button
              type="button"
              className="listing-detail-map-cancel"
              onClick={() => setMapPickerOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListingDetailPage
