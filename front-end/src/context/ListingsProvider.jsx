import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../apiBase'
import { ListingsContext } from './listingsContext'

function listingsEndpoint() {
  return apiUrl('/api/listings')
}

export function ListingsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(listingsEndpoint())
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
    let res
    try {
      res = await fetch(listingsEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch {
      throw new Error(
        'Cannot reach the API. Run: cd back-end && npm start (default http://127.0.0.1:3001, or set PORT / VITE_API_URL).',
      )
    }

    const text = await res.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      if (data && typeof data.error === 'string') {
        throw new Error(data.error)
      }
      const sniff = typeof text === 'string' ? text.slice(0, 60).toLowerCase() : ''
      const looksLikeHtml = sniff.includes('<!doctype') || sniff.includes('<html')
      if (res.status === 404 && looksLikeHtml) {
        throw new Error(
          'Got a web page instead of JSON (404). Run `npm run dev` for the UI and `cd back-end && npm start` for the API (default port 3001).',
        )
      }
      if (res.status === 404) {
        throw new Error(
          'API route not found (404). Start the back-end (cd back-end && npm start) and match VITE_API_URL (default API http://127.0.0.1:3001).',
        )
      }
      throw new Error(`Request failed (${res.status})`)
    }

    if (!data) {
      throw new Error('Invalid response from server')
    }

    setRaw((prev) => [...prev, data])
    return data
  }

  const listings = useMemo(() => raw, [raw])

  const value = useMemo(
    () => ({ listings, loading, error, createListing }),
    [listings, loading, error],
  )

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}
