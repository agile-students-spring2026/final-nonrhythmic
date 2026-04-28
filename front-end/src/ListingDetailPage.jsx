import { useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiOriginForStaticFiles } from './api/client'
import { createContactRequest, submitApplication } from './api/actions'
import { fetchProductById } from './api/fetchProductById'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import './ListingDetailPage.css'

function ListingDetailPage() {
  const { id } = useParams()
  return <ListingDetailInner key={id} id={id} />
}

function ListingDetailInner({ id }) {
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [mapPickerOpen, setMapPickerOpen] = useState(false)
  const [actionDialog, setActionDialog] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [activeAction, setActiveAction] = useState(null)
  const mapTitleId = useId()
  const actionDialogTitleId = useId()
  const mapPrimaryActionRef = useRef(null)
  const actionOkRef = useRef(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [imageZoomOpen, setImageZoomOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setActionError('')

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
  }, [mapPickerOpen])

  useEffect(() => {
    if (!actionDialog) return
    actionOkRef.current?.focus()
  }, [actionDialog])

  useEffect(() => {
    if (!mapPickerOpen && !actionDialog) return
    function onKey(e) {
      if (e.key === 'Escape') {
        setMapPickerOpen(false)
        setActionDialog(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mapPickerOpen, actionDialog])

  useEffect(() => {
    setCurrentImage(0)
  }, [id])

  function openMaps(provider) {
    const q = encodeURIComponent(listing?.mapQuery ?? 'New York, NY')
    const url =
      provider === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${q}`
        : `https://maps.apple.com/?q=${q}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setMapPickerOpen(false)
  }

  async function handleAction(kind) {
    setActionBusy(true)
    setActiveAction(kind)
    setActionError('')

    try {
      if (kind === 'apply') {
        await submitApplication({
          listingId: listing.id,
          userId: user.id,
        })
      } else {
        await createContactRequest({
          targetType: 'listing',
          targetId: String(listing.id),
          userId: user.id,
        })
      }
      setActionDialog(kind)
    } catch (err) {
      setActionError(err.message || 'Could not complete that action right now.')
    } finally {
      setActionBusy(false)
      setActiveAction(null)
    }
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

  const numericReviewCount = Number(listing.reviewCount)
  const hasReviews = Number.isFinite(numericReviewCount) && numericReviewCount > 0
  const hasRating = listing.rating !== null && listing.rating !== undefined && String(listing.rating).trim() !== ''
  const ratingSummary = hasReviews
    ? hasRating
      ? `★ ${listing.rating} · ${numericReviewCount} reviews`
      : `${numericReviewCount} reviews`
    : 'No reviews yet'

  const apiOrigin = getApiOriginForStaticFiles()
  const uploadedImages =
    Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0
      ? listing.imageUrls.map((u) =>
          typeof u === 'string' && u.startsWith('http') ? u : `${apiOrigin}${u}`,
        )
      : null

  const fallbackImages = [
    'https://picsum.photos/id/1018/960/600',
    'https://picsum.photos/id/1015/960/600',
    'https://picsum.photos/id/1019/960/600',
  ]
  const images = uploadedImages && uploadedImages.length > 0 ? uploadedImages : fallbackImages

  const proofLinks = Array.isArray(listing.proofUrls)
    ? listing.proofUrls.map((u) =>
        typeof u === 'string' && u.startsWith('http') ? u : `${apiOrigin}${u}`,
      )
    : []

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
            src={images[currentImage]}
            alt=""
            width={960}
            height={600}
            onClick={() => setImageZoomOpen(true)}
            className="listing-detail-hero-image"
          />

          <button
            type="button"
            className="listing-detail-carousel-btn listing-detail-carousel-btn--left"
            onClick={() =>
              setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
            }
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            className="listing-detail-carousel-btn listing-detail-carousel-btn--right"
            onClick={() =>
              setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
            }
            aria-label="Next image"
          >
            ›
          </button>

          <div className="listing-detail-dots">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                className={
                  index === currentImage
                    ? 'listing-detail-dot listing-detail-dot--active'
                    : 'listing-detail-dot'
                }
                onClick={() => setCurrentImage(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
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

          <p className="listing-detail-rating">{ratingSummary}</p>
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

          {proofLinks.length > 0 ? (
            <div className="listing-detail-proofs">
              <p className="listing-detail-proofs-label">Proof documents</p>
              <ul className="listing-detail-proofs-list">
                {proofLinks.map((href, i) => (
                  <li key={`${href}-${i}`}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      Open document {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="button"
            className="listing-detail-read-more"
            onClick={() => setDescriptionExpanded((v) => !v)}
            aria-expanded={descriptionExpanded}
          >
            {descriptionExpanded ? 'Read less' : 'Read more'}
          </button>

          {actionError ? <p className="listing-detail-inline-status">{actionError}</p> : null}
        </div>

        <footer className="listing-detail-footer">
          <div className="listing-detail-price-block">
            <p className="listing-detail-price-label">Price</p>
            <p className="listing-detail-price-value">{listing.price}</p>
          </div>
          <div className="listing-detail-actions">
            <button
              type="button"
              className="listing-detail-btn listing-detail-btn--ghost"
              onClick={() => handleAction('contact')}
              disabled={actionBusy}
            >
              {actionBusy && activeAction === 'contact' ? 'Sending...' : 'Contact'}
            </button>
            <button
              type="button"
              className="listing-detail-btn listing-detail-btn--primary"
              onClick={() => handleAction('apply')}
              disabled={actionBusy}
            >
              {actionBusy && activeAction === 'apply' ? 'Submitting...' : 'Apply now'}
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
      {imageZoomOpen ? (
        <div
          className="listing-detail-zoom-overlay"
          role="presentation"
          onClick={() => setImageZoomOpen(false)}
        >
          <div className="listing-detail-zoom-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="listing-detail-zoom-close"
              onClick={() => setImageZoomOpen(false)}
              aria-label="Close image preview"
            >
              ×
            </button>

            <button
              type="button"
              className="listing-detail-zoom-btn listing-detail-zoom-btn--left"
              onClick={() =>
                setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
              }
              aria-label="Previous image"
            >
              ‹
            </button>

            <img src={images[currentImage]} alt="" className="listing-detail-zoom-image" />

            <button
              type="button"
              className="listing-detail-zoom-btn listing-detail-zoom-btn--right"
              onClick={() =>
                setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
              }
              aria-label="Next image"
            >
              ›
            </button>
          </div>
        </div>
      ) : null}
      {actionDialog ? (
        <div
          className="listing-detail-map-overlay"
          role="presentation"
          onClick={() => setActionDialog(null)}
        >
          <div
            className="listing-detail-map-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={actionDialogTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={actionDialogTitleId} className="listing-detail-map-dialog-title">
              {actionDialog === 'apply' ? 'Application saved' : 'Contact saved'}
            </h2>
            <p className="listing-detail-map-dialog-text">
              {actionDialog === 'apply'
                ? 'Your application was saved. The lister can see your name and email in their profile notifications.'
                : 'The lister was notified. They can see your name and account email in their profile to follow up with you. SubVet does not provide in-app chat yet.'}
            </p>
            <button
              ref={actionOkRef}
              type="button"
              className="listing-detail-btn listing-detail-btn--primary listing-detail-action-ok"
              onClick={() => setActionDialog(null)}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListingDetailPage
