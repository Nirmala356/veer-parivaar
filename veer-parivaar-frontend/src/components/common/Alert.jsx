import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

const styles = {
  error: 'border-danger/20 bg-red-50 text-danger',
  success: 'border-success/20 bg-green-50 text-success',
  info: 'border-accent/20 bg-blue-50 text-navy-secondary',
}

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

export function Alert({ tone = 'info', title, children }) {
  const Icon = icons[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded-lg border px-3.5 py-3 text-sm',
        styles[tone],
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <p className={title ? 'mt-1' : ''}>{children}</p> : null}
      </div>
    </div>
  )
}
