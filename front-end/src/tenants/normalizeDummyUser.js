const AREAS = [
  'East Village, Greenwich Village',
  'Brooklyn Heights, Downtown Brooklyn',
  'Long Island City, Astoria',
  'Harlem, Morningside Heights',
  'Financial District, Tribeca',
  'Williamsburg, Greenpoint',
  'Jersey City, Journal Square',
  'Downtown Brooklyn',
]

const WINDOWS = [
  'Jun 1 – Aug 28, 2026',
  'May 20 – Aug 15, 2026',
  'Jun 10 – Aug 20, 2026',
  'Jun 1 – Jul 31, 2026',
  'Jun 5 – Sep 1, 2026',
  'May 28 – Aug 25, 2026',
  'Jun 1 – Aug 31, 2026',
  'Jun 1 – Aug 20, 2026',
]

export function normalizeDummyUser(u) {
  if (!u || typeof u.id !== 'number') return null

  const first = String(u.firstName ?? '').trim()
  const last = String(u.lastName ?? '').trim()
  const displayName = [first, last].filter(Boolean).join(' ') || `User ${u.id}`
  const city = u.address?.city || 'New York'
  const uni = u.university || 'University'
  const co =
    typeof u.company === 'object' && u.company?.name
      ? u.company.name
      : typeof u.company === 'string'
        ? u.company
        : 'Summer internship'

  const idx = u.id % AREAS.length
  const lo = 800 + (u.id % 10) * 50
  const hi = 900 + (u.id % 10) * 50
  const firstName = first || 'This student'

  return {
    id: String(u.id),
    displayName,
    age: typeof u.age === 'number' ? u.age : 22,
    neighborhoods: AREAS[idx],
    subleaseWindow: WINDOWS[idx],
    budget: `$${lo}–${hi}/mo`,
    intro: `${firstName} (${uni}) is looking for a summer sublease near ${city} and prefers a quiet, transit-friendly setup.`,
    ideal:
      'Furnished or lightly furnished, laundry in building or nearby, respectful roommates if shared, good transit access.',
    questions: 'Utilities split in summer? Guest policy? Building laundry?',
    company: co,
    avatarSeed: `subvet-tenant-${u.id}`,
  }
}
