import { useState } from 'react'
import { LogOut, Menu, User, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { Logo } from '../common/Logo'
import { useAuth } from '../../context/useAuth'
import { cn } from '../../utils/cn'
import { getRoleDashboardPath } from '../../utils/roles'

const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, role, email, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  const dashboardPath = getRoleDashboardPath(role)
  const roleLabel =
    role === 'ADMIN'
      ? 'Admin Portal'
      : role === 'VOLUNTEER'
        ? 'Volunteer Portal'
        : 'Family Portal'

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo inverted compact />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 no-underline hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <User className="size-3.5" />
                <span className="max-w-[160px] truncate" title={email || ''}>
                  {email}
                </span>
              </span>
              <Button to={dashboardPath} variant="secondary" size="sm">
                {roleLabel}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-white/80 hover:text-white"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">
                Sign In
              </Button>
              <Button to="/register" variant="secondary" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>
      <div
        id="mobile-nav"
        className={cn(
          'border-t border-white/10 px-4 py-4 md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <nav className="flex flex-col gap-3" aria-label="Mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-1 text-sm font-medium text-white/85 no-underline"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated ? (
            <>
              <div className="border-t border-white/10 pt-2 text-xs text-white/60">
                Signed in as: <span className="font-semibold text-white/90">{email}</span>
              </div>
              <NavLink
                to={dashboardPath}
                className="py-1 text-sm font-medium text-white/85 no-underline"
                onClick={() => setOpen(false)}
              >
                {roleLabel}
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 py-1 text-left text-sm font-medium text-red-300 no-underline"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="py-1 text-sm font-medium text-white/85 no-underline"
                onClick={() => setOpen(false)}
              >
                Sign In
              </NavLink>
              <Button to="/register" variant="secondary" size="sm" className="mt-2">
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
