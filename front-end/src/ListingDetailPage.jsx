import { Link } from 'react-router-dom'

function ListingDetailPage() {
  return (
    <div className="page">
      <div className="phone-frame detail-page">
        <div className="detail-image-box">
          <Link to="/" className="back-button">←</Link>
          <div className="detail-image-text">image</div>
        </div>

        <div className="detail-header-row">
          <h2 className="detail-title">Title</h2>
          <p className="show-map">Show map</p>
        </div>

        <p className="detail-rating">★ Rating (Reviews)</p>
        <p className="detail-location">Location</p>

        <p className="detail-description">
          Spacious and fully furnished 1-bedroom apartment available for
          summer sublease from June to August. Located near campus and close
          to grocery stores...
        </p>

        <p className="read-more">Read more</p>

        <div className="detail-bottom-row">
          <div>
            <p className="price-label">Price</p>
            <p className="detail-price">$123</p>
          </div>

          <div className="detail-buttons">
            <button className="action-btn">Contact</button>
            <button className="action-btn">Apply Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetailPage