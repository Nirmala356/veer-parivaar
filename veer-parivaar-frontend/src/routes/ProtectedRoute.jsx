import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getRoleDashboardPath } from '../utils/roles'

export function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user role is unrecognized, reset session safely
  const userDashboard = getRoleDashboardPath(role)
  if (userDashboard === '/login') {
    logout()
    return <Navigate to="/login" replace />
  }

  // If role is not allowed for this route, redirect to user's own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={userDashboard} replace />
  }

  return <Outlet />
}
