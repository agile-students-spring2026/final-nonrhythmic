import { useEffect, useMemo, useState } from 'react'
import { TenantsContext } from './tenantsContext'
import { normalizeDummyUser } from '../tenants/normalizeDummyUser'

const USERS_URL =
  'https://dummyjson.com/users?limit=8&select=id,firstName,lastName,age,company,address,university'

export function TenantsProvider({ children }) {
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(USERS_URL)
      .then((r) => {
        if (!r.ok) throw new Error('Could not load tenants')
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setRaw(Array.isArray(data.users) ? data.users : [])
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

  const tenants = useMemo(() => raw.map(normalizeDummyUser).filter(Boolean), [raw])

  const value = useMemo(
    () => ({ tenants, loading, error }),
    [tenants, loading, error],
  )

  return <TenantsContext.Provider value={value}>{children}</TenantsContext.Provider>
}
