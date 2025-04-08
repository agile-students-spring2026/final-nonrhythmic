function parseRentUsd(price) {
  const m = String(price).replace(/,/g, '').match(/(\d+)/)
  return m ? Number(m[1]) : 0
}

function normalizeRating(rating) {
  const n = typeof rating === 'number' ? rating : Number(rating)
  if (Number.isFinite(n)) return n.toFixed(1)
  return '4.0'
}

function mapQueryForLocation(location) {
  const s = String(location).trim()
  if (/jersey city/i.test(s)) return 'Jersey City, NJ'
  if (s.includes(',')) return s
  return `${s}, New York, NY`
}

module.exports = {
  parseRentUsd,
  normalizeRating,
  mapQueryForLocation,
}
