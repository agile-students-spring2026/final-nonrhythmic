import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './ListingDetailPage.css'

const LISTING_MAP_QUERY =
  'Greenwich Village, Manhattan, New York, NY'

const LISTING_DESCRIPTION = `Spacious and fully furnished 1-bedroom apartment available for summer sublease from June through August. Near transit, grocery, and laundry. Quiet building; utilities included except internet.

The unit gets strong daylight, includes a desk and basic kitchenware, and the building has an elevator. Ideal for one person or a couple; no pets per lease. Move-in flexible within the first week of June; move-out by August 31.`

function ListingDetailPage() {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [mapPickerOpen, setMapPickerOpen] = useState(false)
  const mapTitleId = useId()
  const mapPrimaryActionRef = useRef(null)

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
    const q = encodeURIComponent(LISTING_MAP_QUERY)
    const url =
      provider === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${q}`
        : `https://maps.apple.com/?q=${q}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setMapPickerOpen(false)
  }

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
            src="https://picsum.photos/seed/subvet-detail/960/600"
            alt=""
            width={960}
            height={600}
          />
        </div>

        <div className="listing-detail-body">
          <div className="listing-detail-header">
            <h1 className="listing-detail-title">Summer sublet near campus</h1>
            <button
              type="button"
              className="listing-detail-map-link listing-detail-map-trigger"
              onClick={() => setMapPickerOpen(true)}
            >
              Show map
            </button>
          </div>

          <p className="listing-detail-rating">★ 4.8 · 24 reviews</p>
          <p className="listing-detail-location">Manhattan · 12 min to campus</p>

          <p
            className={
              descriptionExpanded
                ? 'listing-detail-description listing-detail-description--expanded'
                : 'listing-detail-description listing-detail-description--clamped'
            }
          >
            {LISTING_DESCRIPTION}
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
            <p className="listing-detail-price-value">$1,200/mo</p>
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