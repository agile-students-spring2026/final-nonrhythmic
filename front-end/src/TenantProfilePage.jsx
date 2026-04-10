import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createContactRequest } from './api/actions'
import { getTenantById } from './api/tenants'
import MainNav from './MainNav'
import { useAuth } from './hooks/useAuth'
import { useTenants } from './hooks/useTenants'
import './TenantProfilePage.css'

function TenantProfileDetail({ tenant }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  async function handleContact() {
    if (!user) {
      navigate('/login')
      return
    }

    setSubmitting(true)
    setStatus('')

    try {
      await createContactRequest({
        targetType: 'tenant',
        targetId: tenant.id,
        userId: user.id,
      })
      setStatus('Contact request sent.')
    } catch (err) {
      setStatus(err.message || 'Could not send your contact request.')
    } finally {
      setSubmitting(false)
    }
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
            {status ? <p className="tenant-profile-status">{status}</p> : null}
          </div>
          <button type="button" className="tenant-profile-contact" onClick={handleContact} disabled={submitting}>
            {submitting ? 'Sending...' : 'Contact'}
          </button>
        </footer>
        <MainNav active="tenants" />
      </article>
    </div>
  )
}

function TenantProfileFetchById({ id }) {
  const [state, setState] = useState(() => ({ status: 'loading', tenant: null }))

  useEffect(() => {
    let cancelled = false

    getTenantById(id)
      .then((tenant) => {
        if (!cancelled) {
          setState({ status: 'ok', tenant })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'missing', tenant: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (state.status === 'loading') {
    return (
      <div className="tenant-profile-page">
        <div className="tenant-profile-shell tenant-profile-shell--narrow">
          <p className="tenant-profile-missing">Loading tenant…</p>
          <MainNav active="tenants" />
        </div>
      </div>
    )
  }

  if (!state.tenant) {
    return (
      <div className="tenant-profile-page">
        <div className="tenant-profile-shell tenant-profile-shell--narrow">
          <p className="tenant-profile-missing">That tenant profile is not available.</p>
          <Link to="/tenants" className="tenant-profile-back-link">
            Back to intern tenants
          </Link>
          <MainNav active="tenants" />
        </div>
      </div>
    )
  }

  return <TenantProfileDetail tenant={state.tenant} />
}

function TenantProfilePage() {
  const { tenantId } = useParams()
  const { tenants, loading, error } = useTenants()

  const fromList = useMemo(
    () => (tenantId ? tenants.find((tenant) => tenant.id === tenantId) : undefined),
    [tenants, tenantId],
  )

  if (loading) {
    return (
      <div className="tenant-profile-page">
        <div className="tenant-profile-shell tenant-profile-shell--narrow">
          <p className="tenant-profile-missing">Loading tenant…</p>
          <MainNav active="tenants" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tenant-profile-page">
        <div className="tenant-profile-shell tenant-profile-shell--narrow">
          <p className="tenant-profile-missing">{error}</p>
          <Link to="/tenants" className="tenant-profile-back-link">
            Back to intern tenants
          </Link>
          <MainNav active="tenants" />
        </div>
      </div>
    )
  }

  if (fromList) {
    return <TenantProfileDetail tenant={fromList} />
  }

  if (tenantId) {
    return <TenantProfileFetchById key={tenantId} id={tenantId} />
  }

  return (
    <div className="tenant-profile-page">
      <div className="tenant-profile-shell tenant-profile-shell--narrow">
        <p className="tenant-profile-missing">That tenant profile is not available.</p>
        <Link to="/tenants" className="tenant-profile-back-link">
          Back to intern tenants
        </Link>
        <MainNav active="tenants" />
      </div>
    </div>
  )
}

export default TenantProfilePage
