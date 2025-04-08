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
  'Glass tower room · LIC skyline views',
  'Huge living room share · prewar six layout',
  'Journal Square · coffee and PATH downstairs',
  'Morningside room · Columbia internship summer',
  'Split-level loft · WFH-friendly nook',
  'Garden-level studio · quiet back courtyard',
  'Corner unit · double exposures east/west',
  'Sleep loft + full kitchen · Nolita edge',
  'Converted loft · 12 ft ceilings',
  'Near Prospect Park · mellow brownstone block',
  'Dumbo-adjacent · bike storage included',
  'Midtown summer lease · month-to-month friendly',
  'High-floor studio · northern city light',
  'Duplex with terrace · pet-friendly building',
  'Union Square 15-min walk · elevator',
  'Battery Park calm · easy ferry to BK',
  'Long Island City 1BR · amenities floor',
  'Crown Heights prewar · express A/C nearby',
  'Park Slope garden apartment · June–Aug',
  'Ridgewood railroad · artistic housemates',
  'Sunny railroad in Ridgewood walk-up',
  'Chelsea gallery district · furnished studio',
  'Stuy Town perimeter · green space access',
  'SoHo-border loft share · summer interns',
  'Tribeca-adjacent flex room · doorman',
  'Sunnyside garden 1BR · 7 train quick',
  'Upper West prewar · museum block quiet',
  'Bed–Stuy parlor floor · summer only',
]

const SUBLEASE_DESCRIPTIONS = [
  'Summer sublease from a current tenant. Fully furnished, fast Wi‑Fi, and chill building staff. Photos are representative of layout; happy to video walkthrough before you commit.',
  'Intern-friendly dates with a little move-in flexibility the first week of June. Utilities included except electric; laundry in basement. No parties—respectful neighbors.',
  'Quiet unit facing the courtyard. Desk, monitor stand, and basic kitchen gear stay. Ideal for one person or a couple; sublet approved by management with paperwork.',
  'Light-filled space with AC in-window and decent closet storage. Steps to subway and grocery; summer-only—landlord knows and is fine with student subletters.',
  'Roommates are two other interns—shared bath stays clean on a loose chore rotation. Common space has a big dining table for late-night work.',
  'Short walk to campus and multiple train lines. Building is older but maintained; super lives on-site. Security deposit held in escrow per standard lease rider.',
  'Corner studio with enough room for a Peloton or yoga mat by the window. Gym in building; package room 24/7. Perfect if you want turnkey for 10–12 weeks.',
  'Top floor so no upstairs footsteps. Heat and hot water included; you cover internet. Flexible on exact move-out if your internship runs long—we can discuss.',
]

function mapQueryForArea(area) {
  if (area === 'Jersey City') return 'Jersey City, NJ'
  return `${area}, New York, NY`
}

function buildListing(id) {
  const bhk = BHK_KEYS[id % BHK_KEYS.length]
  const area = AREAS[id % AREAS.length]
  const rentUsd = Math.min(2200, Math.max(650, Math.round((6 + (id % 44)) * 25)))
  const rating = (4 + (id % 10) / 10).toFixed(1)
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
    details,
    bhk,
    area,
    rentUsd,
    description,
    mapQuery: mapQueryForArea(area),
  }
}

const MAX_ID = 40
const allListings = []
for (let id = 1; id <= MAX_ID; id += 1) {
  allListings.push(buildListing(id))
}

function getListingById(idNum) {
  return allListings.find((l) => l.id === idNum) ?? null
}

module.exports = { allListings, getListingById, buildListing }
