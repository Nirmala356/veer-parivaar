import { Card } from '../common/Card'

export function AuthFormCard({ title, subtitle, children }) {
  return (
    <Card className="w-full max-w-md p-7 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-navy">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </Card>
  )
}
