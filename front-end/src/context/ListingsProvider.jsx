import { useEffect, useMemo, useState } from 'react'
import { ListingsContext } from './listingsContext'

const LISTINGS_URL = 'http://localhost:3000/api/listings'

export function ListingsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(LISTINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Could not load listings')
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setRaw(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setError('Unable to reach the listings service. Check your connection.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function createListing(payload) {
    const res = await fetch(LISTINGS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      throw new Error('Could not create listing')
    }

    const created = await res.json()
    setRaw((prev) => [...prev, created])
    return created
  }

  const listings = useMemo(() => raw, [raw])

  const value = useMemo(
    () => ({ listings, loading, error, createListing }),
    [listings, loading, error],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}
