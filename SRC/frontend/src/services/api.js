const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // Response has no JSON body
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
    throw new Error(message)
  }

  return payload
}

const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) =>
    request(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (path, data) =>
    request(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: (path, data) =>
    request(path, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export default api
