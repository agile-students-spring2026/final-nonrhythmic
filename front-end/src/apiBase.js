/**
 * In development with `npm run dev`, default is same-origin `/api/...` so Vite can proxy
 * to Express (see vite.config.js). Express defaults to port 3001.
 *
 * Set VITE_API_URL to a full origin (e.g. http://127.0.0.1:3002) to skip the proxy.
 * Do not include `/api` or a trailing slash on the origin.
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL
  if (raw !== undefined && String(raw).trim() !== '') {
    let b = String(raw).trim().replace(/\/$/, '')
    if (b.endsWith('/api')) b = b.slice(0, -4)
    return b
  }
  if (import.meta.env.DEV) return ''
  return 'http://127.0.0.1:3001'
}

export function apiUrl(path) {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  if (base === '') return p
  return `${base}${p}`
}
