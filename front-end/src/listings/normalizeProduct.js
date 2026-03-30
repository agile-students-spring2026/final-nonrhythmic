const AREAS = ['Manhattan', 'Brooklyn', 'Queens', 'Jersey City']
const BHK_KEYS = ['studio', '1', '2', 'room']

export function normalizeProduct(p) {
  if (!p || typeof p.id !== 'number') return null
  const bhk = BHK_KEYS[p.id % BHK_KEYS.length]
  const area = AREAS[p.id % AREAS.length]
  const rentUsd = Math.min(2200, Math.max(650, Math.round(Number(p.price) * 12)))
  const rating =
    typeof p.rating === 'number' ? p.rating.toFixed(1) : (4 + (p.id % 10) / 10).toFixed(1)
  const title = typeof p.title === 'string' ? p.title : `Listing ${p.id}`
  const details =
    p.brand && p.category
      ? `${String(p.brand)} · ${String(p.category)}`
      : p.category
        ? String(p.category)
        : 'Sublease · furnished'

  return {
    id: p.id,
    name: title.length > 72 ? `${title.slice(0, 69)}…` : title,
    location: area,
    price: `$${rentUsd.toLocaleString('en-US')}/mo`,
    rating,
    details,
    bhk,
    area,
    rentUsd,
    description:
      typeof p.description === 'string' && p.description.trim()
        ? p.description.trim()
        : 'Details will load from the server once the back-end is connected.',
    mapQuery: `${area}, New York, NY`,
  }
}
