import { Link } from 'react-router-dom'
import ListingCard from './ListingCard'

function ListingsPage() {
  const listings = [
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
    {
      id: 3,
      name: 'Queens Studio',
      location: 'Queens',
      price: '$1100/month',
    },
  ]

  return (
    <div className="page">
      <div className="phone-frame">
        <h1 className="title">Find Subleases</h1>

        <div className="search-row">
          <input className="search" placeholder="Search..." />
          <button className="filter-btn">≡</button>
        </div>

        {listings.map((listing) => (
          <Link to="/listing" className="card-link" key={listing.id}>
            <ListingCard
              name={listing.name}
              location={listing.location}
              price={listing.price}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ListingsPage