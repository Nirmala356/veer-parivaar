import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export function Logo({ inverted = false, compact = false, to = '/' }) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 no-underline',
        inverted ? 'text-white' : 'text-navy',
      )}
    >
      <span
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-lg',
          inverted ? 'bg-white/12 text-white' : 'bg-navy text-white',
        )}
        aria-hidden="true"
      >
        <Shield className="size-5" strokeWidth={1.8} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-semibold tracking-tight">
          Veer Parivaar
        </span>
        {compact ? null : (
          <span
            className={cn(
              'text-xs font-medium',
              inverted ? 'text-white/70' : 'text-muted',
            )}
          >
            Defence family welfare
          </span>
        )}
      </span>
    </Link>
  )
}
