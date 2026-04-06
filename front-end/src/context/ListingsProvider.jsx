import { useEffect, useMemo, useState } from 'react'
import { ListingsContext } from './listingsContext'
// import { normalizeProduct } from '../listings/normalizeProduct'

// const PRODUCTS_URL = 'https://dummyjson.com/products?limit=40'
const LISTINGS_URL = 'http://localhost:3000/api/listings'

export function ListingsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    // fetch(PRODUCTS_URL)
    fetch(LISTINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Could not load listings')
        return r.json()
      })
      // .then((data) => {
      //   if (!cancelled) setRaw(Array.isArray(data.products) ? data.products : [])
      // })
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

  // const listings = useMemo(() => raw.map(normalizeProduct).filter(Boolean), [raw])
  const listings = useMemo(() => raw, [raw])

  const value = useMemo(
    () => ({ listings, loading, error }),
    [listings, loading, error],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}
