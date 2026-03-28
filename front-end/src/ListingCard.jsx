function ListingCard({ name, location, price, imageSeed, variant = 'default' }) {
  const rootClass =
    variant === 'feed' ? 'listing-card listing-card--feed' : 'listing-card'

  const thumb =
    imageSeed != null ? (
      <div className="listing-card__thumb">
        <img
          src={`https://picsum.photos/seed/${imageSeed}/152/152`}
          alt=""
          width={152}
          height={152}
        />
      </div>
    ) : (
      <div className="image-box">Image</div>
    )

  const body =
    variant === 'feed' ? (
      <div className="listing-info">
        <div className="listing-top">
          <p className="listing-name">{name}</p>
          <p className="listing-rating">★ 4.5</p>
        </div>
        <p className="listing-location">{location}</p>
        <p className="listing-details">2 bed · 1 bath</p>
        <p className="listing-price">{price}</p>
        <span className="save-icon" aria-hidden="true">
          ♡
        </span>
      </div>
    ) : (
      <>
        <div className="listing-info">
          <p className="listing-rating">★ Rating</p>
          <p className="listing-name">{name}</p>
          <p className="listing-location">{location}</p>
          <p className="listing-details">Details</p>
          <p className="listing-price">{price}</p>
        </div>
        <div className="save-icon">♡</div>
      </>
    )

  return (
    <div className={rootClass}>
      {thumb}
      {body}
    </div>
  )
}

export default ListingCard