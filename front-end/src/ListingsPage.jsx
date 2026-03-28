import { useMemo, useState } from 'react'
import ListingCard from './ListingCard'
import './ListingsPage.css'

const LISTINGS = [
  { id: 1, name: 'NYC Apartment', location: 'Manhattan', price: '$1,200/mo', rating: '4.7', details: '1 bed · 1 bath' },
  { id: 2, name: 'Brooklyn Room', location: 'Brooklyn', price: '$900/mo', rating: '4.4', details: 'Private room · shared bath' },
  { id: 3, name: 'Queens Studio', location: 'Queens', price: '$1,100/mo', rating: '4.6', details: 'Studio · 1 bath' },
  { id: 4, name: 'East Village Walk-up', location: 'Manhattan', price: '$1,350/mo', rating: '4.8', details: '2 bed · 1 bath' },
  { id: 5, name: 'Journal Square 2BR', location: 'Jersey City', price: '$1,050/mo', rating: '4.3', details: '2 bed · 1 bath' },
  { id: 6, name: 'Williamsburg Loft', location: 'Brooklyn', price: '$1,450/mo', rating: '4.9', details: '1 bed · 1 bath' },
  { id: 7, name: 'Astoria Summer Sublet', location: 'Queens', price: '$980/mo', rating: '4.5', details: '1 bed · 1 bath' },
  { id: 8, name: 'Harlem Room Share', location: 'Manhattan', price: '$850/mo', rating: '4.2', details: 'Private room · 2 bed unit' },
  { id: 9, name: 'Financial District Studio', location: 'Manhattan', price: '$1,600/mo', rating: '4.6', details: 'Studio · 1 bath' },
  { id: 10, name: 'Bushwick Artist Flat', location: 'Brooklyn', price: '$1,175/mo', rating: '4.7', details: '2 bed · 1 bath' },
]

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

function ListingsPage() {
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const visibleListings = useMemo(
    () => LISTINGS.filter((l) => listingMatchesQuery(l, searchQuery)),
    [searchQuery],
  )

  function toggleSaved(id) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="listings-page">
      <div className="listings-shell">
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
          <button type="button" className="listings-filter-btn" aria-label="Filters">
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
              No listings match &ldquo;{searchQuery.trim()}&rdquo;. Try another neighborhood or
              keyword.
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
    </div>
  )
}

export default ListingsPage
