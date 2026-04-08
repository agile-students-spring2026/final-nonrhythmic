const TENANTS = Array.from({ length: 8 }).map((_, idx) => {
  const id = String(idx + 1)
  const neighborhoods = [
    'East Village, Greenwich Village',
    'Brooklyn Heights, Downtown Brooklyn',
    'Long Island City, Astoria',
    'Harlem, Morningside Heights',
    'Financial District, Tribeca',
    'Williamsburg, Greenpoint',
    'Jersey City, Journal Square',
    'Downtown Brooklyn',
  ][idx]

  const subleaseWindow = [
    'Jun 1 – Aug 28, 2026',
    'May 20 – Aug 15, 2026',
    'Jun 10 – Aug 20, 2026',
    'Jun 1 – Jul 31, 2026',
    'Jun 5 – Sep 1, 2026',
    'May 28 – Aug 25, 2026',
    'Jun 1 – Aug 31, 2026',
    'Jun 1 – Aug 20, 2026',
  ][idx]

  const lo = 800 + (idx % 10) * 50
  const hi = 900 + (idx % 10) * 50

  return {
    id,
    displayName: `Tenant ${id}`,
    age: 20 + idx,
    neighborhoods,
    subleaseWindow,
    budget: `$${lo}–${hi}/mo`,
    intro: `Tenant ${id} is looking for a summer sublease with easy transit access.`,
    ideal:
      'Furnished or lightly furnished, laundry in building or nearby, respectful roommates if shared.',
    questions: 'Utilities split in summer? Guest policy? Laundry?',
    company: 'Summer internship',
    avatarSeed: `subvet-tenant-${id}`,
  }
})

module.exports = TENANTS

