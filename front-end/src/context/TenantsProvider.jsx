import { useEffect, useState } from 'react'
import { createTenant as createTenantRequest, getTenants } from '../api/tenants'
import { TenantsContext } from './tenantsContext'

export function TenantsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getTenants()
      .then((data) => {
        if (!cancelled) setRaw(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setError('Unable to reach the tenant directory. Check your connection.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function createTenant(payload) {
    const created = await createTenantRequest(payload)
    setRaw((prev) => [...prev, created])
    return created
  }

  const value = { tenants: raw, loading, error, createTenant }

  return <TenantsContext.Provider value={value}>{children}</TenantsContext.Provider>
}
