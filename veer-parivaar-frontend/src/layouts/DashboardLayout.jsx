import { LogOut, ExternalLink, ShieldCheck, UserCheck, HeartHandshake } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Logo } from '../components/common/Logo'
import { useAuth } from '../context/useAuth'
import { getRoleDashboardPath } from '../utils/roles'

const roleMetadata = {
  ADMIN: {
    title: 'Defence Administration Portal',
    subtitle: 'System-wide support request triage, volunteer assignments, and status monitoring.',
    badge: 'Administrator',
    badgeTone: 'danger',
    icon: ShieldCheck,
  },
  VOLUNTEER: {
    title: 'Volunteer Operations Portal',
    subtitle: 'Manage assigned martyr family support requests and active case transitions.',
    badge: 'Field Volunteer',
    badgeTone: 'warning',
    icon: HeartHandshake,
  },
  FAMILY_MEMBER: {
    title: 'Veer Parivaar Family Portal',
    subtitle: 'Submit support requests, maintain your family profile, and securely share verified documents.',
    badge: 'Martyr Family',
    badgeTone: 'success',
    icon: UserCheck,
  },
}

export function DashboardLayout() {
  const { role, email, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const meta = roleMetadata[role] || {
    title: 'Portal Dashboard',
    subtitle: 'Authenticated user management.',
    badge: role || 'User',
    badgeTone: 'navy',
    icon: ShieldCheck,
  }

  const Icon = meta.icon
  const homePath = getRoleDashboardPath(role)

  return (
    <div className="flex min-h-svh flex-col bg-page">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 border-b border-navy-secondary/30 bg-navy text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to={homePath} className="no-underline">
              <Logo inverted compact />
            </Link>
            <div className="hidden h-5 w-px bg-white/20 sm:block" />
            <Badge tone={meta.badgeTone} className="hidden sm:inline-flex">
              {meta.badge}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 text-xs font-medium text-white/75 no-underline transition hover:text-white sm:flex"
            >
              <ExternalLink className="size-3.5" />
              Public Site
            </Link>
            <div className="hidden h-4 w-px bg-white/20 sm:block" />
            <div className="text-right">
              <p className="text-xs font-semibold text-white/95 max-w-[180px] truncate" title={email || ''}>
                {email}
              </p>
              <p className="text-[11px] text-white/60 sm:hidden">
                {meta.badge}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-white/85 hover:bg-white/10 hover:text-white"
              title="Sign out of your session"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sub-header Hero Banner */}
      <div className="border-b border-line bg-surface px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
                <Icon className="size-6 text-navy" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-navy sm:text-2xl">
                  {meta.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted">
                  {meta.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Portal Content */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Dashboard Footer */}
      <footer className="border-t border-line bg-surface py-4 text-center text-xs text-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>
            Veer Parivaar V1 &mdash; Official Armed Forces Martyr Family Support Platform. Secure and authenticated.
          </p>
        </div>
      </footer>
    </div>
  )
}
