import { useEffect, useState } from 'react'
import { createListing as createListingRequest, getListings } from '../api/listings'
import { ListingsContext } from './listingsContext'



const DEMO_USER_ID = 'demo'
const SAVED_LISTINGS_URL = `http://localhost:3000/api/users/${DEMO_USER_ID}/saved-listings`


export function ListingsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedIds, setSavedIds] = useState([])
  // const [savedIds, setSavedIds] = useState(() => {
  //   const saved = localStorage.getItem('savedListings')
  //   return saved ? JSON.parse(saved) : []
  // })

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

  useEffect(() => {
  let cancelled = false

    fetch(SAVED_LISTINGS_URL)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => {
        if (!cancelled) {
          setSavedIds(Array.isArray(data) ? data.map((item) => item.id) : [])
        }
      })
      .catch(() => {
        if (!cancelled) setSavedIds([])
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

  async function saveListing(listingId) {
  await fetch(SAVED_LISTINGS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId }),
  })

  setSavedIds((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]))
}

  async function unsaveListing(listingId) {
    await fetch(`${SAVED_LISTINGS_URL}/${listingId}`, {
      method: 'DELETE',
    })

    setSavedIds((prev) => prev.filter((id) => id !== listingId))
  }

  async function toggleSaved(listingId) {
    if (savedIds.includes(listingId)) {
      await unsaveListing(listingId)
    } else {
      await saveListing(listingId)
    }
  }

  // const value = { listings: raw, loading, error, createListing }
  // const value = { listings: raw, loading, error, createListing, savedIds }
  const value = {
  listings: raw,
  loading,
  error,
  createListing,
  savedIds,
  saveListing,
  unsaveListing,
  toggleSaved,
}

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}
