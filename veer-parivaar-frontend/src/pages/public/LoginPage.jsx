import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '../../components/common/Alert'
import { Button } from '../../components/common/Button'
import { PasswordField } from '../../components/common/PasswordField'
import { TextField } from '../../components/common/TextField'
import { AuthFormCard } from '../../components/forms/AuthFormCard'
import { useAuth } from '../../context/useAuth'
import { authService } from '../../services/api'
import { getRoleDashboardPath } from '../../utils/roles'
import { validateLoginForm } from '../../utils/validation'

export function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { login: setAuthSession } = useAuth()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: undefined }))
    }
    if (serverError) {
      setServerError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isLoading) {
      return
    }

    setServerError('')
    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const data = await authService.login(values)
      setAuthSession(data)

      const targetPath = getRoleDashboardPath(data.role)
      const fromPath = location.state?.from?.pathname

      // If user attempted to navigate to an allowed path matching their role, honor it
      if (fromPath && fromPath.startsWith(targetPath)) {
        navigate(fromPath, { replace: true })
      } else {
        navigate(targetPath, { replace: true })
      }
    } catch (error) {
      setServerError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6 lg:py-16">
      <AuthFormCard
        title="Sign in"
        subtitle="Use the email and password for your Veer Parivaar account."
      >
        {serverError ? (
          <Alert tone="error" title="Sign in failed">
            {serverError}
          </Alert>
        ) : null}

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            label="Email"
            required
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            disabled={isLoading}
          />
          <PasswordField
            id="login-password"
            name="password"
            autoComplete="current-password"
            label="Password"
            required
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />
          <Button type="submit" className="mt-1 w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          New to Veer Parivaar?{' '}
          <Link to="/register" className="font-semibold text-navy">
            Create an account
          </Link>
        </p>
      </AuthFormCard>
    </div>
  )
}
