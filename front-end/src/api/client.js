function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  // Same-origin `/api` in dev → Vite proxies to the Express server (see vite.config.js).
  // if (import.meta.env.DEV) return '/api'
  if (import.meta.env.DEV) return 'http://localhost:3000/api'
  return 'http://localhost:3000/api'
}

const API_BASE_URL = resolveApiBaseUrl()

/** Origin for `/uploads/...` paths returned by the API (no trailing slash). */
export function getApiOriginForStaticFiles() {
  return API_BASE_URL.replace(/\/api\/?$/, '') || ''
}
const AUTH_TOKEN_STORAGE_KEY = 'subvet.authToken'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseResponse(res) {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Upload files to POST /api/upload; returns absolute-path URLs like `/uploads/...`. */
export async function uploadFiles(files) {
  const list = Array.from(files ?? []).filter(Boolean)
  if (list.length === 0) return []

  const fd = new FormData()
  for (const f of list) {
    fd.append('files', f)
  }

  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  })

  const payload = await parseResponse(res)

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && payload.error ? payload.error : 'Upload failed'
    throw new ApiError(String(message), res.status)
  }

  return Array.isArray(payload?.urls) ? payload.urls : []
}

export async function apiRequest(path, options = {}) {
  const hasBody = options.body !== undefined
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  const payload = await parseResponse(res)

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? payload.error
        : 'Request failed'
    throw new ApiError(String(message), res.status)
  }

  return payload
}
