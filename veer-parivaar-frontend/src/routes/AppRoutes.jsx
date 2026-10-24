import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { FamilyDashboard } from '../pages/family/FamilyDashboard'
import { LandingPage } from '../pages/public/LandingPage'
import { LoginPage } from '../pages/public/LoginPage'
import { RegisterPage } from '../pages/public/RegisterPage'
import { VolunteerDashboard } from '../pages/volunteer/VolunteerDashboard'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { getRoleDashboardPath } from '../utils/roles'

function FallbackRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (isAuthenticated && role) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }
  return <Navigate to="/" replace />
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Authenticated Role Dashboards */}
      <Route element={<DashboardLayout />}>
        {/* Defence Administrator Portal */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Volunteer Operations Portal */}
        <Route element={<ProtectedRoute allowedRoles={['VOLUNTEER']} />}>
          <Route path="/volunteer" element={<VolunteerDashboard />} />
        </Route>

        {/* Family Member Portal */}
        <Route element={<ProtectedRoute allowedRoles={['FAMILY_MEMBER']} />}>
          <Route path="/family" element={<FamilyDashboard />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<FallbackRedirect />} />
    </Routes>
  )
}
