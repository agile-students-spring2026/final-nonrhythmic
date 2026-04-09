import { useEffect, useState } from 'react'
import { createListing as createListingRequest, getListings } from '../api/listings'
import { ListingsContext } from './listingsContext'

export function ListingsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getListings()
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
    const created = await createListingRequest(payload)
    setRaw((prev) => [...prev, created])
    return created
  }

  const value = { listings: raw, loading, error, createListing }

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}
