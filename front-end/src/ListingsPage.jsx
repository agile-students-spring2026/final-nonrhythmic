import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'
import './ListingsPage.css'

const LISTINGS = [
  { id: 1, name: 'NYC Apartment', location: 'Manhattan', price: '$1,200/mo', rating: '4.7', details: '1 bed · 1 bath', bhk: '1', area: 'Manhattan', rentUsd: 1200 },
  { id: 2, name: 'Brooklyn Room', location: 'Brooklyn', price: '$900/mo', rating: '4.4', details: 'Private room · shared bath', bhk: 'room', area: 'Brooklyn', rentUsd: 900 },
  { id: 3, name: 'Queens Studio', location: 'Queens', price: '$1,100/mo', rating: '4.6', details: 'Studio · 1 bath', bhk: 'studio', area: 'Queens', rentUsd: 1100 },
  { id: 4, name: 'East Village Walk-up', location: 'Manhattan', price: '$1,350/mo', rating: '4.8', details: '2 bed · 1 bath', bhk: '2', area: 'Manhattan', rentUsd: 1350 },
  { id: 5, name: 'Journal Square 2BR', location: 'Jersey City', price: '$1,050/mo', rating: '4.3', details: '2 bed · 1 bath', bhk: '2', area: 'Jersey City', rentUsd: 1050 },
  { id: 6, name: 'Williamsburg Loft', location: 'Brooklyn', price: '$1,450/mo', rating: '4.9', details: '1 bed · 1 bath', bhk: '1', area: 'Brooklyn', rentUsd: 1450 },
  { id: 7, name: 'Astoria Summer Sublet', location: 'Queens', price: '$980/mo', rating: '4.5', details: '1 bed · 1 bath', bhk: '1', area: 'Queens', rentUsd: 980 },
  { id: 8, name: 'Harlem Room Share', location: 'Manhattan', price: '$850/mo', rating: '4.2', details: 'Private room · 2 bed unit', bhk: 'room', area: 'Manhattan', rentUsd: 850 },
  { id: 9, name: 'Financial District Studio', location: 'Manhattan', price: '$1,600/mo', rating: '4.6', details: 'Studio · 1 bath', bhk: 'studio', area: 'Manhattan', rentUsd: 1600 },
  { id: 10, name: 'Bushwick Artist Flat', location: 'Brooklyn', price: '$1,175/mo', rating: '4.7', details: '2 bed · 1 bath', bhk: '2', area: 'Brooklyn', rentUsd: 1175 },
]

const BHK_OPTIONS = [
  { key: 'studio', label: 'Studio' },
  { key: '1', label: '1 BHK' },
  { key: '2', label: '2 BHK' },
  { key: 'room', label: 'Room / shared' },
]

const RENT_BANDS = [
  { key: 'any', label: 'Any rent' },
  { key: 'lt1000', label: 'Under $1,000 / mo' },
  { key: '1000to1300', label: '$1,000 – $1,300 / mo' },
  { key: 'gt1300', label: 'Over $1,300 / mo' },
]

const AREA_OPTIONS = [...new Set(LISTINGS.map((l) => l.area))].sort()

function cloneFilters(f) {
  return {
    bhk: [...f.bhk],
    areas: [...f.areas],
    rentBand: f.rentBand,
  }
}

const DEFAULT_FILTERS = {
  bhk: [],
  areas: [],
  rentBand: 'any',
}

function listingMatchesQuery(listing, rawQuery) {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    listing.name,
    listing.location,
    listing.details,
    listing.price,
  ]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((token) => haystack.includes(token))
}

function listingMatchesFilters(listing, f) {
  if (f.bhk.length > 0 && !f.bhk.includes(listing.bhk)) return false
  if (f.areas.length > 0 && !f.areas.includes(listing.area)) return false
  const r = listing.rentUsd
  if (f.rentBand === 'lt1000' && r >= 1000) return false
  if (f.rentBand === '1000to1300' && (r < 1000 || r > 1300)) return false
  if (f.rentBand === 'gt1300' && r <= 1300) return false
  return true
}

function filtersAreActive(f) {
  return f.bhk.length > 0 || f.areas.length > 0 || f.rentBand !== 'any'
}

function toggleListValue(list, value) {
  if (list.includes(value)) return list.filter((x) => x !== value)
  return [...list, value]
}

function ListingsPage() {
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState(() => cloneFilters(DEFAULT_FILTERS))
  const [filterOpen, setFilterOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState(() => cloneFilters(DEFAULT_FILTERS))
  const filterTitleId = useId()

  useEffect(() => {
    if (!filterOpen) return
    function onKey(e) {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filterOpen])

  const visibleListings = useMemo(
    () =>
      LISTINGS.filter(
        (l) =>
          listingMatchesQuery(l, searchQuery) && listingMatchesFilters(l, appliedFilters),
      ),
    [searchQuery, appliedFilters],
  )

  function toggleSaved(id) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function applyFilters() {
    setAppliedFilters(cloneFilters(draftFilters))
    setFilterOpen(false)
  }

  function clearDraftFilters() {
    setDraftFilters(cloneFilters(DEFAULT_FILTERS))
  }

  const hasActiveFilters = filtersAreActive(appliedFilters)

  return (
    <div className="listings-page">
      <div className="listings-shell">
        <div className="listings-home-bar">
          <Link to="/" className="listings-home-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4v-7H9v7H5a1 1 0 01-1-1v-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </Link>
        </div>
        <h1 className="listings-heading">Find Subleases</h1>

        <div className="listings-toolbar">
          <label className="listings-search-wrap">
            <svg
              className="listings-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              className="listings-search"
              type="search"
              placeholder="Search neighborhoods"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-controls="listings-feed"
            />
          </label>
          <button
            type="button"
            className={
              hasActiveFilters
                ? 'listings-filter-btn listings-filter-btn--active'
                : 'listings-filter-btn'
            }
            aria-label="Filters"
            aria-expanded={filterOpen}
            onClick={() => {
              setDraftFilters(cloneFilters(appliedFilters))
              setFilterOpen(true)
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="listings-feed" id="listings-feed" role="list">
          {visibleListings.length === 0 ? (
            <p className="listings-empty" role="status">
              No listings match your search or filters. Try adjusting keywords or clear filters
              and search again.
            </p>
          ) : (
            visibleListings.map((listing) => (
              <div key={listing.id} role="listitem">
                <ListingCard
                  variant="feed"
                  to="/listing"
                  imageSeed={`subvet-${listing.id}`}
                  name={listing.name}
                  location={listing.location}
                  price={listing.price}
                  rating={listing.rating}
                  details={listing.details}
                  saved={savedIds.has(listing.id)}
                  onFavoriteToggle={() => toggleSaved(listing.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {filterOpen ? (
        <div
          className="listings-filter-overlay"
          role="presentation"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="listings-filter-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={filterTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={filterTitleId} className="listings-filter-title">
              Filters
            </h2>

            <div className="listings-filter-scroll">
              <fieldset className="listings-filter-fieldset">
                <legend className="listings-filter-legend">BHK</legend>
                <div className="listings-filter-chips">
                  {BHK_OPTIONS.map((opt) => (
                    <label key={opt.key} className="listings-filter-chip">
                      <input
                        type="checkbox"
                        checked={draftFilters.bhk.includes(opt.key)}
                        onChange={() =>
                          setDraftFilters((d) => ({
                            ...d,
                            bhk: toggleListValue(d.bhk, opt.key),
                          }))
                        }
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="listings-filter-fieldset">
                <legend className="listings-filter-legend">Area</legend>
                <div className="listings-filter-chips">
                  {AREA_OPTIONS.map((area) => (
                    <label key={area} className="listings-filter-chip">
                      <input
                        type="checkbox"
                        checked={draftFilters.areas.includes(area)}
                        onChange={() =>
                          setDraftFilters((d) => ({
                            ...d,
                            areas: toggleListValue(d.areas, area),
                          }))
                        }
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="listings-filter-fieldset">
                <legend className="listings-filter-legend">Rent (monthly)</legend>
                <div className="listings-filter-rent">
                  {RENT_BANDS.map((band) => (
                    <label key={band.key} className="listings-filter-rent-option">
                      <input
                        type="radio"
                        name="rentBand"
                        value={band.key}
                        checked={draftFilters.rentBand === band.key}
                        onChange={() =>
                          setDraftFilters((d) => ({ ...d, rentBand: band.key }))
                        }
                      />
                      <span>{band.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="listings-filter-actions">
              <button
                type="button"
                className="listings-filter-secondary"
                onClick={clearDraftFilters}
              >
                Clear all
              </button>
              <button type="button" className="listings-filter-primary" onClick={applyFilters}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ListingsPage
