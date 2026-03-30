import { Link, useParams } from 'react-router-dom'
import { getTenantById } from './data/tenants'
import './TenantProfilePage.css'

function TenantProfilePage() {
  const { tenantId } = useParams()
  const tenant = tenantId ? getTenantById(tenantId) : undefined

  if (!tenant) {
    return (
      <div className="tenant-profile-page">
        <div className="tenant-profile-shell tenant-profile-shell--narrow">
          <p className="tenant-profile-missing">That tenant profile is not available.</p>
          <Link to="/tenants" className="tenant-profile-back-link">
            Back to intern tenants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tenant-profile-page">
      <article className="tenant-profile-shell">
        <header className="tenant-profile-header">
          <Link to="/tenants" className="tenant-profile-back" aria-label="Back to tenant list">
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
          <div className="tenant-profile-hero">
            <div className="tenant-profile-photo-wrap">
              <img
                src={`https://picsum.photos/seed/${tenant.avatarSeed}/400/400`}
                alt=""
                width={400}
                height={400}
              />
            </div>
            <div className="tenant-profile-title-block">
              <h1 className="tenant-profile-name">{tenant.displayName}</h1>
              <p className="tenant-profile-company">{tenant.company}</p>
              <p className="tenant-profile-sub">Personal details</p>
            </div>
          </div>
        </header>

        <div className="tenant-profile-body">
          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">Age</h2>
            <p className="tenant-profile-value">{tenant.age}</p>
          </section>

          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">Neighborhoods I like</h2>
            <p className="tenant-profile-value">{tenant.neighborhoods}</p>
          </section>

          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">Introduction</h2>
            <p className="tenant-profile-blurb">{tenant.intro}</p>
          </section>

          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">What my ideal apartment looks like</h2>
            <p className="tenant-profile-blurb">{tenant.ideal}</p>
          </section>

          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">Questions I have for you</h2>
            <p className="tenant-profile-blurb">{tenant.questions}</p>
          </section>

          <section className="tenant-profile-section">
            <h2 className="tenant-profile-label">Sublease window</h2>
            <p className="tenant-profile-value">{tenant.subleaseWindow}</p>
          </section>
        </div>

        <footer className="tenant-profile-footer">
          <div>
            <p className="tenant-profile-price-label">Budget</p>
            <p className="tenant-profile-price">{tenant.budget}</p>
          </div>
          <button type="button" className="tenant-profile-contact">
            Contact
          </button>
        </footer>
      </article>
    </div>
  )
}

export default TenantProfilePage
