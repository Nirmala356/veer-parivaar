import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getRoleDashboardPath } from '../utils/roles'

export function PublicOnlyRoute() {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  return <Outlet />
}
