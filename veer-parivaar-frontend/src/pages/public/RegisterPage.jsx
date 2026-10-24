import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../../components/common/Alert'
import { Button } from '../../components/common/Button'
import { PasswordField } from '../../components/common/PasswordField'
import { TextField } from '../../components/common/TextField'
import { AuthFormCard } from '../../components/forms/AuthFormCard'
import { authService } from '../../services/api'
import { validateRegisterForm } from '../../utils/validation'

export function RegisterPage() {
  const [values, setValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
    if (isLoading) return

    setServerError('')
    setSuccessMessage('')
    const nextErrors = validateRegisterForm(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      await authService.register({
        email: values.email,
        password: values.password,
      })
      setSuccessMessage('Account created successfully! You can now sign in to your family portal.')
      setValues({ email: '', password: '', confirmPassword: '' })
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6 lg:py-16">
      <AuthFormCard
        title="Create an account"
        subtitle="New accounts are created as family members. Email and password are the only details required at registration."
      >
        {serverError ? (
          <Alert tone="error" title="Registration failed">
            {serverError}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert tone="success" title="Registration successful">
            <div className="flex flex-col gap-2">
              <span>{successMessage}</span>
              <Button to="/login" variant="primary" size="sm" className="w-fit">
                Proceed to Sign In
              </Button>
            </div>
          </Alert>
        ) : null}

        {!successMessage ? (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <TextField
              id="register-email"
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
              id="register-password"
              name="password"
              autoComplete="new-password"
              label="Password"
              required
              hint="Use at least 8 characters."
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isLoading}
            />
            <PasswordField
              id="register-confirm-password"
              name="confirmPassword"
              autoComplete="new-password"
              label="Confirm password"
              required
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              disabled={isLoading}
            />
            <Button type="submit" className="mt-1 w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        ) : null}

        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy">
            Sign in
          </Link>
        </p>
      </AuthFormCard>
    </div>
  )
}

