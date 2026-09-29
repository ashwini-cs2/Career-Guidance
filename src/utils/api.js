// Shared API client for the FastAPI backend.
//
// Base URL is read from the VITE_API_URL env var (create a `.env` file in
// `frontend/career-advisor/` — see `.env.example`). Falls back to the local
// dev server if not set.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// The backend requires a Supabase-issued JWT on every request
// (see backend/app/middleware/auth.py). Store it under this key once real
// auth is wired up — AuthContext.jsx currently does NOT do this yet.
const TOKEN_KEY = 'access_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const isFormData = options.body instanceof FormData

  const headers = { ...(options.headers || {}) }
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0)
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') detail = data.detail
      else if (Array.isArray(data.detail)) {
        // FastAPI validation errors
        detail = data.detail.map(d => d.msg).join('; ')
      }
    } catch {
      // response wasn't JSON — keep the generic message
    }
    if (res.status === 401) {
      detail = 'You need to be signed in for this. ' + detail
    }
    throw new ApiError(detail, res.status)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
}

export { ApiError }
