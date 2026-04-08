import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainNav from './MainNav'
import './AddListingPage.css'

const initialForm = {
  role: 'sublessor',
  name: '',
  age: '',
  sublessorAddress: '',
  sublessorFrom: '',
  sublessorTo: '',
  sublessorDetails: '',
  tenantNeighborhoods: '',
  tenantFrom: '',
  tenantTo: '',
  tenantIdeal: '',
  tenantComments: '',
}

function AddListingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const isSublessor = form.role === 'sublessor'

    const payload = isSublessor
      ? {
          name: form.name || 'New Listing',
          location: form.sublessorAddress || 'New York',
          price: '$1000/month',
          rating: 4.5,
          details: 'Details',
          description: form.sublessorDetails || 'New sublease listing',
          owner: 'Kaiyuan Wu',
        }
      : {
          name: `${form.name || 'Tenant'} Application`,
          location: form.tenantNeighborhoods || 'New York',
          price: '$0/month',
          rating: 4.0,
          details: 'Details',
          description: form.tenantIdeal || form.tenantComments || 'Tenant application',
          owner: 'Kaiyuan Wu',
        }

    try {
      const res = await fetch('http://localhost:3000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Failed to submit listing')
      }

      await res.json()
      setSubmitted(true)
    } catch (err) {
      setSubmitError('Could not submit listing right now.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setSubmitted(false)
    setSubmitError('')
  }

  if (submitted) {
    return (
      <div className="add-listing-page">
        <div className="add-listing-shell add-listing-shell--done">
          <div className="add-listing-success">
            <h1 className="add-listing-title add-listing-title--plain">Thanks</h1>
            <p className="add-listing-success-text">Your application was received.</p>
            <div className="add-listing-success-actions">
              <button type="button" className="add-listing-btn add-listing-btn--secondary" onClick={handleReset}>
                Submit another
              </button>
              <button
                type="button"
                className="add-listing-btn add-listing-btn--primary"
                onClick={() => navigate('/profile')}
              >
                Go to profile
              </button>
            </div>
          </div>
          <MainNav active="add" />
        </div>
      </div>
    )
  }

  const isSublessor = form.role === 'sublessor'

  return (
    <div className="add-listing-page">
      <div className="add-listing-shell">
        <Link to="/" className="add-listing-back" aria-label="Home">
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
        <h1 className="add-listing-title">Create listing</h1>
        <p className="add-listing-lead">
          Post a sublease you are offering, or a tenant application if you are still looking.
        </p>

        <form className="add-listing-form" onSubmit={handleSubmit}>
          <fieldset className="add-listing-fieldset add-listing-fieldset--plain">
            <legend className="add-listing-legend">I am</legend>
            <div className="add-listing-role-toggle">
              <button
                type="button"
                className={
                  isSublessor ? 'add-listing-role-btn add-listing-role-btn--active' : 'add-listing-role-btn'
                }
                onClick={() => update('role', 'sublessor')}
                aria-pressed={isSublessor}
              >
                Sublessor
              </button>
              <button
                type="button"
                className={
                  !isSublessor ? 'add-listing-role-btn add-listing-role-btn--active' : 'add-listing-role-btn'
                }
                onClick={() => update('role', 'tenant')}
                aria-pressed={!isSublessor}
              >
                Tenant
              </button>
            </div>
          </fieldset>

          <div className="add-listing-row-split add-listing-row-split--name-age">
            <label className="add-listing-field">
              <span className="add-listing-label">Name</span>
              <input
                className="add-listing-input"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </label>
            <label className="add-listing-field">
              <span className="add-listing-label">Age</span>
              <input
                className="add-listing-input"
                type="number"
                min={16}
                max={99}
                inputMode="numeric"
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                required
              />
            </label>
          </div>

          {isSublessor ? (
            <>
              <label className="add-listing-field">
                <span className="add-listing-label">Address of sublet</span>
                <input
                  className="add-listing-input"
                  type="text"
                  placeholder="Street, unit, city"
                  value={form.sublessorAddress}
                  onChange={(e) => update('sublessorAddress', e.target.value)}
                  required
                />
              </label>
              <div className="add-listing-row-split add-listing-row-split--dates">
                <label className="add-listing-field">
                  <span className="add-listing-label">Available from</span>
                  <input
                    className="add-listing-input"
                    type="date"
                    value={form.sublessorFrom}
                    onChange={(e) => update('sublessorFrom', e.target.value)}
                    required
                  />
                </label>
                <label className="add-listing-field">
                  <span className="add-listing-label">To</span>
                  <input
                    className="add-listing-input"
                    type="date"
                    value={form.sublessorTo}
                    onChange={(e) => update('sublessorTo', e.target.value)}
                    required
                  />
                </label>
              </div>
              <label className="add-listing-field">
                <span className="add-listing-label">Sublet details</span>
                <textarea
                  className="add-listing-textarea"
                  rows={4}
                  placeholder="Rent, utilities, room layout, building rules…"
                  value={form.sublessorDetails}
                  onChange={(e) => update('sublessorDetails', e.target.value)}
                  required
                />
              </label>
              <label className="add-listing-field">
                <span className="add-listing-label">Photos or diagram of apartment</span>
                <input className="add-listing-file" type="file" accept="image/*,.pdf" multiple />
              </label>
              <label className="add-listing-field">
                <span className="add-listing-label">Proof of sublet</span>
                <input className="add-listing-file" type="file" accept=".pdf,image/*" />
              </label>
            </>
          ) : (
            <>
              <label className="add-listing-field">
                <span className="add-listing-label">Preferred neighborhoods</span>
                <input
                  className="add-listing-input"
                  type="text"
                  placeholder="e.g. Astoria, Jersey City PATH"
                  value={form.tenantNeighborhoods}
                  onChange={(e) => update('tenantNeighborhoods', e.target.value)}
                  required
                />
              </label>
              <div className="add-listing-row-split add-listing-row-split--dates">
                <label className="add-listing-field">
                  <span className="add-listing-label">Need from</span>
                  <input
                    className="add-listing-input"
                    type="date"
                    value={form.tenantFrom}
                    onChange={(e) => update('tenantFrom', e.target.value)}
                    required
                  />
                </label>
                <label className="add-listing-field">
                  <span className="add-listing-label">To</span>
                  <input
                    className="add-listing-input"
                    type="date"
                    value={form.tenantTo}
                    onChange={(e) => update('tenantTo', e.target.value)}
                    required
                  />
                </label>
              </div>
              <label className="add-listing-field">
                <span className="add-listing-label">Ideal apartment</span>
                <textarea
                  className="add-listing-textarea"
                  rows={3}
                  placeholder="Bed count, budget range, must-haves…"
                  value={form.tenantIdeal}
                  onChange={(e) => update('tenantIdeal', e.target.value)}
                  required
                />
              </label>
              <label className="add-listing-field">
                <span className="add-listing-label">Comments or questions for landlords</span>
                <textarea
                  className="add-listing-textarea"
                  rows={3}
                  value={form.tenantComments}
                  onChange={(e) => update('tenantComments', e.target.value)}
                />
              </label>
              <label className="add-listing-field">
                <span className="add-listing-label">Proof of identity</span>
                <input className="add-listing-file" type="file" accept="image/*,.pdf" />
              </label>
            </>
          )}

          {submitError ? <p className="add-listing-error">{submitError}</p> : null}

          <button type="submit" className="add-listing-submit" disabled={submitting}>
            {submitting
              ? 'Submitting...'
              : isSublessor
                ? 'Submit sublessor application'
                : 'Submit rental application'}
          </button>
        </form>

        <MainNav active="add" />
      </div>
    </div>
  )
}

export default AddListingPage
