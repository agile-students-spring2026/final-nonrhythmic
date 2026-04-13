/**
 * Dev: `/api` on the Vite origin (see vite proxy). Build/preview without env: full URL to Express.
 * Override: VITE_API_BASE_URL=https://host.example.com/api
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? '/api' : 'http://localhost:3000/api')

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

export async function apiRequest(path, options = {}) {
  const hasBody = options.body !== undefined
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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
