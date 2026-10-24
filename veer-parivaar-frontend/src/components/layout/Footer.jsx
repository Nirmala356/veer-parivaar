import { Logo } from '../common/Logo'

const COPYRIGHT_YEAR = 2026

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
            A digital welfare platform for Indian defence families to keep
            records in order and request support with dignity and clarity.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Platform
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <a href="/#features" className="hover:text-white">
                Family features
              </a>
            </li>
            <li>
              <a href="/#how-it-works" className="hover:text-white">
                How it works
              </a>
            </li>
            <li>
              <a href="/login" className="hover:text-white">
                Sign in
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-white">
            Stewardship
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Access is role-based. Family members, volunteers, and
            administrators each see only the work they are authorised to
            handle.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-white/55 sm:px-6">
          © {COPYRIGHT_YEAR} Veer Parivaar. Built for defence
          families.
        </p>
      </div>
    </footer>
  )
}
