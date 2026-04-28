import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { buildLoginUrl } from './utils/authRedirect'

/** All app routes except login/register require a signed-in user. */
export default function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const redirectPath = `${location.pathname}${location.search ?? ''}`
    return <Navigate to={buildLoginUrl(redirectPath)} replace />
  }

  return <Outlet />
}
