import { useContext } from 'react'
import { ListingsContext } from '../context/listingsContext'

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
