const AREAS = ['Manhattan', 'Brooklyn', 'Queens', 'Jersey City']
const BHK_KEYS = ['studio', '1', '2', 'room']

const BHK_DETAILS = {
  studio: 'Studio · 1 bath',
  '1': '1 bed · 1 bath',
  '2': '2 bed · 1 bath',
  room: 'Private room · shared unit',
}

const SUBLEASE_TITLES = [
  'Sunny bedroom in a classic Village walk-up',
  'Quiet alcove studio · full-service doorman',
  'Bright room in a Williamsburg brownstone',
  'Top-floor 2BR near campus · elevator building',
  'Cozy crash pad off Midtown · utilities included',
  'South-facing studio · laundry in building',
  'Private room in a renovated JC loft near PATH',
  'Pre-war charm · Harlem summer room share',
  'Flex dates · Financial District high-floor studio',
  'Tree-lined block · sunny Bushwick 2BR',
  'Astoria sublet · 10 min to N/W trains',
  'Walk-up with character · Greenpoint border',
]

const SUBLEASE_DESCRIPTIONS = [
  'Summer sublease. Furnished, fast Wi‑Fi, and calm building staff. Happy to do a quick video walkthrough before you commit.',
  'Intern-friendly dates with a little move-in flexibility. Utilities included except electric; laundry in basement. No parties—respectful neighbors.',
  'Quiet unit facing a courtyard. Desk and basic kitchen gear included. Ideal for one person; paperwork ready for building approval.',
  'Light-filled space with AC and good closet storage. Steps to subway and grocery; summer-only and straightforward.',
]

function mapQueryForArea(area) {
  if (area === 'Jersey City') return 'Jersey City, NJ'
  return `${area}, New York, NY`
}

function buildListing(id) {
  const bhk = BHK_KEYS[id % BHK_KEYS.length]
  const area = AREAS[id % AREAS.length]
  const rentUsd = 850 + (id % 20) * 75
  const rating = (4 + (id % 10) / 10).toFixed(1)
  const reviewCount = 8 + (id % 18)
  const title = SUBLEASE_TITLES[id % SUBLEASE_TITLES.length]
  const name = title.length > 72 ? `${title.slice(0, 69)}…` : title
  const details = BHK_DETAILS[bhk] ?? 'Sublease'
  const description = SUBLEASE_DESCRIPTIONS[id % SUBLEASE_DESCRIPTIONS.length]

  return {
    id,
    name,
    location: area,
    price: `$${rentUsd.toLocaleString('en-US')}/mo`,
    rating,
    reviewCount,
    details,
    bhk,
    area,
    rentUsd,
    description,
    mapQuery: mapQueryForArea(area),
  }
}

const listings = Array.from({ length: 5 }).map((_, idx) => buildListing(idx + 1))

module.exports = listings
