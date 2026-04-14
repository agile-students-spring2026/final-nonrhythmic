import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import { createListing as createListingRequest, getListings } from '../api/listings'
import { useAuth } from '../hooks/useAuth'
import { ListingsContext } from './listingsContext'

export function ListingsProvider({ children }) {
  const { user } = useAuth()
  const activeUserId = user?.id ?? null
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedIds, setSavedIds] = useState([])

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
    if (!activeUserId) {
      setSavedIds([])
      return
    }

    let cancelled = false

    apiRequest(`/users/${activeUserId}/saved-listings`)
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
  }, [activeUserId])

  async function createListing(payload) {
    const created = await createListingRequest(payload)
    setRaw((prev) => [...prev, created])
    return created
  }

  async function saveListing(listingId) {
    if (!activeUserId) {
      throw new Error('Login required to save listings.')
    }

    await apiRequest(`/users/${activeUserId}/saved-listings`, {
      method: 'POST',
      body: { listingId },
    })
    setSavedIds((prev) => (prev.includes(listingId) ? prev : [...prev, listingId]))
  }

  async function unsaveListing(listingId) {
    if (!activeUserId) {
      throw new Error('Login required to manage saved listings.')
    }

    await apiRequest(`/users/${activeUserId}/saved-listings/${listingId}`, {
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
