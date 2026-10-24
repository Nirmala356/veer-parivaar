/**
 * Centralized API client for Veer Parivaar
 * Handles JWT authentication headers, response normalization, and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Set JSON headers unless sending FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    headers['Accept'] = 'application/json'
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error(
      'Unable to connect to the server. Please check your network or verify the backend is running.',
    )
  }

  if (response.status === 401) {
    let errorMessage = endpoint.includes('/api/auth/login')
      ? 'Invalid email or password'
      : 'Session expired or unauthorized. Please sign in again.'
    try {
      const data = await response.json()
      if (data?.error && typeof data.error === 'string') {
        errorMessage = data.error
      } else if (data?.message && typeof data.message === 'string') {
        errorMessage = data.message
      }
    } catch {
      // Retain default message
    }
    const error = new Error(errorMessage)
    error.status = 401
    throw error
  }

  if (response.status === 403) {
    let errorMessage = 'You do not have permission to perform this action.'
    try {
      const data = await response.json()
      if (data?.error && typeof data.error === 'string') {
        errorMessage = data.error
      } else if (data?.message && typeof data.message === 'string') {
        errorMessage = data.message
      }
    } catch {
      // Retain default message
    }
    const error = new Error(errorMessage)
    error.status = 403
    throw error
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`
    try {
      const data = await response.json()
      if (data?.error && typeof data.error === 'string') {
        errorMessage = data.error
      } else if (data?.message && typeof data.message === 'string') {
        errorMessage = data.message
      }
    } catch {
      if (response.statusText) {
        errorMessage = response.statusText
      }
    }
    const error = new Error(errorMessage)
    error.status = response.status
    throw error
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return response
}

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
export const authService = {
  async login({ email, password }) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  async register({ email, password }) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
}

// -----------------------------------------------------------------------------
// Administrator Endpoints
// -----------------------------------------------------------------------------
export const adminService = {
  async getAllRequests() {
    return request('/api/admin/support-requests')
  },
  async assignRequest(requestId, volunteerId) {
    return request(`/api/admin/support-requests/${requestId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ volunteerId: Number(volunteerId) }),
    })
  },
  async updateRequestStatus(requestId, status) {
    return request(`/api/staff/support-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

// -----------------------------------------------------------------------------
// Volunteer / Staff Endpoints
// -----------------------------------------------------------------------------
export const volunteerService = {
  async getAssignedRequests() {
    return request('/api/staff/support-requests')
  },
  async getRequestDetails(requestId) {
    return request(`/api/staff/support-requests/${requestId}`)
  },
  async updateStatus(requestId, status) {
    return request(`/api/staff/support-requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

// -----------------------------------------------------------------------------
// Family Member Endpoints
// -----------------------------------------------------------------------------
export const familyService = {
  async getProfile() {
    return request('/api/family-profile')
  },
  async createProfile({ phoneNumber, address, serviceDetails }) {
    return request('/api/family-profile', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, address, serviceDetails }),
    })
  },
  async getRequests() {
    return request('/api/support-requests')
  },
  async createRequest({ category, description, priority }) {
    return request('/api/support-requests', {
      method: 'POST',
      body: JSON.stringify({ category, description, priority }),
    })
  },
  async getDocuments() {
    return request('/api/documents')
  },
  async uploadDocument(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })
  },
  async downloadDocument(documentId, fileName) {
    const response = await request(`/api/documents/${documentId}/download`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName || `document-${documentId}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
