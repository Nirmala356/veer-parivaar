const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isRequired(value) {
  return String(value ?? '').trim().length > 0
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim())
}

export function validateLoginForm({ email, password }) {
  const errors = {}

  if (!isRequired(email)) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!isRequired(password)) {
    errors.password = 'Password is required.'
  }

  return errors
}

export function validateRegisterForm({ email, password, confirmPassword }) {
  const errors = validateLoginForm({ email, password })

  if (isRequired(password) && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!isRequired(confirmPassword)) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}
