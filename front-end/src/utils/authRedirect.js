/**
 * Sanitize post-login redirect targets: internal paths only (no open redirects).
 */
export function getSafeRedirect(raw, defaultPath = '/') {
  if (typeof raw !== 'string') return defaultPath
  const path = raw.trim().split(/[?#]/)[0]
  if (!path.startsWith('/') || path.startsWith('//')) return defaultPath
  return path || defaultPath
}

/** Login URL that returns the user to `fromPath` after sign-in. */
export function buildLoginUrl(fromPath = '/') {
  const safe = getSafeRedirect(fromPath, '/')
  return `/login?redirect=${encodeURIComponent(safe)}`
}
