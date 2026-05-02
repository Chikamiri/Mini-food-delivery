const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const hasJsonBody =
    options.body != null &&
    options.body !== '' &&
    typeof options.body === 'string'
  const headers = {
    ...options.headers,
  }
  if (hasJsonBody) headers['Content-Type'] = 'application/json'

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
    // Auto-logout on 401 Unauthorized (#15 fix)
    if (response.status === 401) {
      localStorage.removeItem('token')
      try {
        const { useAuthStore } = await import('@/stores/auth')
        const auth = useAuthStore()
        auth.user = null
        auth.token = null
        auth.error = null
      } catch {
        /* Pinia chưa sẵn sàng hoặc lỗi import */
      }
      try {
        const router = (await import('@/router')).default
        await router.replace({ name: 'home' })
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/'
      }
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    const validationErrors = payload?.data
    const validationMessage =
      validationErrors && typeof validationErrors === 'object'
        ? Object.entries(validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ')
        : null
    const message =
      validationMessage ||
      payload?.message ||
      payload?.error ||
      `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
    throw new Error(message)
  }

  // Normalize backend wrapper shape: { success, message, data, ... }
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
    return payload.data
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
