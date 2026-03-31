import { useContext } from 'react'
import { TenantsContext } from '../context/tenantsContext'

export function useTenants() {
  const ctx = useContext(TenantsContext)
  if (!ctx) throw new Error('useTenants must be used within TenantsProvider')
  return ctx
}
