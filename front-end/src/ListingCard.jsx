import { Link } from 'react-router-dom'

function ListingCard({
  name,
  location,
  price,
  imageSeed,
  variant = 'default',
  to,
  saved = false,
  onFavoriteToggle,
  rating = '4.5',
  details = '2 bed · 1 bath',
}) {
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

  if (variant === 'feed') {
    return (
      <div className={rootClass}>
        <Link to={to} className="listing-card__tap">
          {thumb}
          <div className="listing-info">
            <div className="listing-top">
              <p className="listing-name">{name}</p>
              <p className="listing-rating">★ {rating}</p>
            </div>
            <p className="listing-location">{location}</p>
            <p className="listing-details">{details}</p>
            <p className="listing-price">{price}</p>
          </div>
        </Link>
        <button
          type="button"
          className={
            saved ? 'listing-card__favorite listing-card__favorite--on' : 'listing-card__favorite'
          }
          onClick={onFavoriteToggle}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>
    )
  }

  return (
    <div className={rootClass}>
      {thumb}
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