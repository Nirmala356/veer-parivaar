import { useEffect, useState } from 'react'
import { SUPPORTED_ROLES } from '../utils/roles'
import { AuthContext } from './authContextInstance'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('role')
    const id = localStorage.getItem('id')

    if (token && email && role && SUPPORTED_ROLES.includes(role)) {
      return { token, email, role, id: id ? Number(id) : null }
    }
    return null
  })

  // Synchronize state changes with localStorage
  useEffect(() => {
    function handleStorageChange() {
      const token = localStorage.getItem('token')
      const email = localStorage.getItem('email')
      const role = localStorage.getItem('role')
      const id = localStorage.getItem('id')

      if (token && email && role && SUPPORTED_ROLES.includes(role)) {
        setUser({ token, email, role, id: id ? Number(id) : null })
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function login(authData) {
    if (!authData || !authData.token || !authData.role) {
      throw new Error('Invalid authentication response from server.')
    }

    const role = authData.role
    if (!SUPPORTED_ROLES.includes(role)) {
      throw new Error(`Unsupported role: ${role}`)
    }

    localStorage.setItem('token', authData.token)
    localStorage.setItem('email', authData.email || '')
    localStorage.setItem('role', role)
    if (authData.id != null) {
      localStorage.setItem('id', String(authData.id))
    }

    setUser({
      token: authData.token,
      email: authData.email || '',
      role,
      id: authData.id != null ? Number(authData.id) : null,
    })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    localStorage.removeItem('id')
    setUser(null)
  }

  const value = {
    user,
    token: user?.token || null,
    role: user?.role || null,
    email: user?.email || null,
    isAuthenticated: Boolean(user?.token && user?.role),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
