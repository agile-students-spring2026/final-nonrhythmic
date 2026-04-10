import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useListings } from './hooks/useListings'
import { useTenants } from './hooks/useTenants'
import MainNav from './MainNav'
import './AddListingPage.css'

const initialForm = {
  role: 'sublessor',
  name: '',
  age: '',
  sublessorAddress: '',
  sublessorFrom: '',
  sublessorTo: '',
  sublessorPrice: '',
  sublessorDetails: '',
  tenantNeighborhoods: '',
  tenantFrom: '',
  tenantTo: '',
  tenantBudget: '',
  tenantIdeal: '',
  tenantComments: '',
}

function formatWindow(start, end) {
  if (!start || !end) return 'Flexible summer dates'

  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${formatter.format(new Date(start))} - ${formatter.format(new Date(end))}`
}

function formatMonthlyPrice(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value <= 0) return null
  return `$${value.toLocaleString('en-US')}/mo`
}

function AddListingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createListing } = useListings()
  const { createTenant } = useTenants()
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(null)
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
    const actorName = user?.name || 'Kaiyuan Wu'

    try {
      if (isSublessor) {
        const monthlyPrice = formatMonthlyPrice(form.sublessorPrice)
        if (!monthlyPrice) {
          throw new Error('Enter a valid monthly rent.')
        }

        const createdListing = await createListing({
          name: form.name || 'New Listing',
          location: form.sublessorAddress || 'New York',
          price: monthlyPrice,
          rating: 4.5,
          details: formatWindow(form.sublessorFrom, form.sublessorTo),
          description: form.sublessorDetails || 'New sublease listing',
          owner: actorName,
          bhk: 'room',
          area: form.sublessorAddress || 'New York',
          rentUsd: Number(form.sublessorPrice),
          mapQuery: form.sublessorAddress || 'New York, NY',
        })

        setSubmitted({ role: 'sublessor', targetId: createdListing.id })
      } else {
        const budget = formatMonthlyPrice(form.tenantBudget)
        if (!budget) {
          throw new Error('Enter a valid monthly budget.')
        }

        const createdTenant = await createTenant({
          displayName: form.name || actorName,
          age: Number(form.age),
          neighborhoods: form.tenantNeighborhoods,
          subleaseWindow: formatWindow(form.tenantFrom, form.tenantTo),
          budget,
          intro: `${form.name || actorName} is looking for a summer sublease in ${form.tenantNeighborhoods}.`,
          ideal: form.tenantIdeal || 'Flexible on layout, but looking for a clean and safe place.',
          questions: form.tenantComments || 'No questions yet.',
          company: user?.name || 'Summer internship',
        })

        setSubmitted({ role: 'tenant', targetId: createdTenant.id })
      }
    } catch (err) {
      setSubmitError(err.message || 'Could not submit listing right now.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setForm(initialForm)
    setSubmitted(null)
    setSubmitError('')
  }

  if (submitted) {
    const isSublessor = submitted.role === 'sublessor'

    return (
      <div className="add-listing-page">
        <div className="add-listing-shell add-listing-shell--done">
          <div className="add-listing-success">
            <h1 className="add-listing-title add-listing-title--plain">Thanks</h1>
            <p className="add-listing-success-text">
              {isSublessor
                ? 'Your sublease listing is live.'
                : 'Your tenant profile has been added to the tenant directory.'}
            </p>
            <div className="add-listing-success-actions">
              <button type="button" className="add-listing-btn add-listing-btn--secondary" onClick={handleReset}>
                Submit another
              </button>
              <button
                type="button"
                className="add-listing-btn add-listing-btn--primary"
                onClick={() =>
                  navigate(isSublessor ? '/profile' : `/tenant/${submitted.targetId}`)
                }
              >
                {isSublessor ? 'Go to profile' : 'View tenant profile'}
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
                <span className="add-listing-label">Monthly rent</span>
                <input
                  className="add-listing-input"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="1200"
                  value={form.sublessorPrice}
                  onChange={(e) => update('sublessorPrice', e.target.value)}
                  required
                />
              </label>
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
                <span className="add-listing-label">Monthly budget</span>
                <input
                  className="add-listing-input"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="1100"
                  value={form.tenantBudget}
                  onChange={(e) => update('tenantBudget', e.target.value)}
                  required
                />
              </label>
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
                ? 'Submit sublessor listing'
                : 'Submit tenant application'}
          </button>
        </form>

        <MainNav active="add" />
      </div>
    </div>
  )
}

export default AddListingPage
