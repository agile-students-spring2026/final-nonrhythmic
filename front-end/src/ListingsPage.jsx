import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'
import './ListingsPage.css'

function ListingsPage() {
  const listings = [
    {
      id: 1,
      name: 'NYC Apartment',
      location: 'Manhattan',
      price: '$1,200/mo',
    },
    {
      id: 2,
      name: 'Brooklyn Room',
      location: 'Brooklyn',
      price: '$900/mo',
    },
    {
      id: 3,
      name: 'Queens Studio',
      location: 'Queens',
      price: '$1,100/mo',
    },
  ]

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

        <div className="listings-feed">
          {listings.map((listing) => (
            <Link to="/listing" className="listings-card-link" key={listing.id}>
              <ListingCard
                variant="feed"
                imageSeed={`subvet-${listing.id}`}
                name={listing.name}
                location={listing.location}
                price={listing.price}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ListingsPage