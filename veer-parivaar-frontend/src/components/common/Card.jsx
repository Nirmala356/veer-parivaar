import { cn } from '../../utils/cn'

export function Card({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component
      className={cn(
        'rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
