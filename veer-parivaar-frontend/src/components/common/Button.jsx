import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-navy text-white hover:bg-navy-secondary focus-visible:outline-accent',
  secondary:
    'bg-white text-navy border border-line hover:bg-page focus-visible:outline-accent',
  accent:
    'bg-accent text-white hover:bg-blue-600 focus-visible:outline-navy',
  ghost:
    'bg-transparent text-white hover:bg-white/10 focus-visible:outline-white',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  to,
  type = 'button',
  className,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
