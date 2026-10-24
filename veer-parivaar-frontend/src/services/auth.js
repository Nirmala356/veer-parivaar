export async function login({ email, password }) {
  let response

  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your connection or verify the backend is running.',
    )
  }

  if (!response.ok) {
    let errorMessage = 'Invalid email or password'

    try {
      const data = await response.json()
      if (data && typeof data.error === 'string') {
        errorMessage = data.error
      } else if (data && typeof data.message === 'string') {
        errorMessage = data.message
      }
    } catch {
      if (response.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (response.statusText) {
        errorMessage = response.statusText
      }
    }

    const error = new Error(errorMessage)
    error.status = response.status
    throw error
  }

  return response.json()
}
