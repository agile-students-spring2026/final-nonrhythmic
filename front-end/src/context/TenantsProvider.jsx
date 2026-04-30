import { useEffect, useState } from 'react'
import { createTenant as createTenantRequest, getTenants } from '../api/tenants'
import { useAuth } from '../hooks/useAuth'
import { TenantsContext } from './tenantsContext'

export function TenantsProvider({ children }) {
  const { user } = useAuth()
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(() => Boolean(user))
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user) {
        await Promise.resolve()
        if (cancelled) return
        setRaw([])
        setError(null)
        setLoading(false)
        return
      }
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      setError(null)

      try {
        const data = await getTenants()
        if (!cancelled) setRaw(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setError('Unable to reach the tenant directory. Check your connection.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function createTenant(payload) {
    const created = await createTenantRequest(payload)
    setRaw((prev) => [...prev, created])
    return created
  }

  const value = { tenants: raw, loading, error, createTenant }

  return <TenantsContext.Provider value={value}>{children}</TenantsContext.Provider>
}
