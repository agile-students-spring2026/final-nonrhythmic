function ListingCard({ name, location, price }) {
  return (
    <div className="listing-card">
      <div className="image-box">Image</div>
      <div className="listing-info">
        <p className="listing-rating">★ Rating</p>
        <p className="listing-name">{name}</p>
        <p className="listing-location">{location}</p>
        <p className="listing-details">Details</p>
        <p className="listing-price">{price}</p>
      </div>
      <div className="save-icon">♡</div>
    </div>
  )
}

export default ListingCard