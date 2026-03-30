import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TENANTS } from './data/tenants'
import './TenantsPage.css'

function tenantMatchesLocation(tenant, rawQuery) {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true
  const haystack = [tenant.displayName, tenant.neighborhoods, tenant.subleaseWindow]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((token) => haystack.includes(token))
}

function TenantsPage() {
  const [locationQuery, setLocationQuery] = useState('')

  const visible = useMemo(
    () => TENANTS.filter((t) => tenantMatchesLocation(t, locationQuery)),
    [locationQuery],
  )

  return (
    <div className="tenants-page">
      <div className="tenants-shell">
        <header className="tenants-top">
          <Link to="/" className="tenants-back" aria-label="Home">
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
          <h1 className="tenants-heading">Find Intern Tenants</h1>
        </header>

        <label className="tenants-location-wrap">
          <span className="tenants-location-label">Enter location</span>
          <input
            className="tenants-location-input"
            type="search"
            placeholder="Neighborhood, borough, or landmark"
            autoComplete="off"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            aria-controls="tenants-feed"
          />
        </label>

        <div className="tenants-feed" id="tenants-feed" role="list">
          {visible.length === 0 ? (
            <p className="tenants-empty" role="status">
              No tenants match that location. Try another area or clear the field.
            </p>
          ) : (
            visible.map((tenant) => (
              <div key={tenant.id} role="listitem">
                <Link to={`/tenant/${tenant.id}`} className="tenants-card-link">
                  <article className="tenants-card">
                    <div className="tenants-card-avatar">
                      <img
                        src={`https://picsum.photos/seed/${tenant.avatarSeed}/128/128`}
                        alt=""
                        width={128}
                        height={128}
                      />
                    </div>
                    <div className="tenants-card-body">
                      <h2 className="tenants-card-name">{tenant.displayName}</h2>
                      <p className="tenants-card-line">
                        <span className="tenants-card-k">Age</span> {tenant.age}
                      </p>
                      <p className="tenants-card-line">
                        <span className="tenants-card-k">Preferred neighborhoods</span>{' '}
                        {tenant.neighborhoods}
                      </p>
                      <p className="tenants-card-line">
                        <span className="tenants-card-k">Sublease dates</span> {tenant.subleaseWindow}
                      </p>
                    </div>
                  </article>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default TenantsPage
