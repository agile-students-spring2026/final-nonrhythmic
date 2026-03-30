export const TENANTS = [
  {
    id: 'sam-lee',
    displayName: 'Sam Lee',
    age: 21,
    neighborhoods: 'East Village, Greenwich Village',
    subleaseWindow: 'Jun 1 – Aug 28, 2026',
    budget: '$900–1,100/mo',
    intro:
      'Junior at NYU studying computer science. Interning in Midtown this summer and looking for a quiet sublease within 30 minutes by subway.',
    ideal:
      'Furnished or lightly furnished, laundry in building or nearby, respectful roommates if shared, good natural light for late-night studying.',
    questions:
      'Is the building student-friendly? Any summer maintenance planned? What is the exact move-in flexibility around June 1?',
    company: 'Morgan Stanley',
    avatarSeed: 'subvet-tenant-sam',
  },
  {
    id: 'jordan-patel',
    displayName: 'Jordan Patel',
    age: 22,
    neighborhoods: 'Brooklyn Heights, Downtown Brooklyn',
    subleaseWindow: 'May 20 – Aug 15, 2026',
    budget: '$950–1,200/mo',
    intro:
      'Grad student at Tandon; summer research lab rotation. Non-smoker, tidy, and used to coliving from undergrad.',
    ideal:
      'AC or good ventilation, desk space, preference for 1BR or large room in 2BR with one other person.',
    questions: 'Utilities split in summer? Subletting allowed per lease? Guest policy?',
    company: 'NYU Tandon Research Lab',
    avatarSeed: 'subvet-tenant-jordan',
  },
  {
    id: 'riley-chen',
    displayName: 'Riley Chen',
    age: 20,
    neighborhoods: 'Long Island City, Astoria',
    subleaseWindow: 'Jun 10 – Aug 20, 2026',
    budget: '$850–1,050/mo',
    intro:
      'Intern in publishing / editorial near Hudson Yards. First summer in NYC—looking for something safe and transit-friendly.',
    ideal:
      'Female-identifying preferred in shared units, no party building, grocery and Citi Bike within a few blocks.',
    questions: 'How noisy is the street at night? Package handling for deliveries?',
    company: 'Penguin Random House',
    avatarSeed: 'subvet-tenant-riley',
  },
  {
    id: 'alex-morales',
    displayName: 'Alex Morales',
    age: 23,
    neighborhoods: 'Harlem, Morningside Heights',
    subleaseWindow: 'Jun 1 – Jul 31, 2026',
    budget: '$700–950/mo',
    intro:
      'Startup internship (hybrid). Comfortable with roommates; respectful of shared chores and quiet hours.',
    ideal: 'Fast internet, basic kitchen access, month-to-month flexibility if internship extends.',
    questions: 'Is the lease officially assignable or informal sublet with landlord notice?',
    company: 'Northwind Labs',
    avatarSeed: 'subvet-tenant-alex',
  },
  {
    id: 'taylor-kim',
    displayName: 'Taylor Kim',
    age: 22,
    neighborhoods: 'Financial District, Tribeca',
    subleaseWindow: 'Jun 5 – Sep 1, 2026',
    budget: '$1,100–1,400/mo',
    intro:
      'Law firm summer associate. Need a professional setup for occasional video calls and a calm space after long hours.',
    ideal:
      'Doorman or secure entry preferred, in-unit laundry or reliable service nearby, minimal furnishng OK if price reflects.',
    questions: 'Exact square footage? Any construction nearby this summer?',
    company: 'Skadden, Arps, Slate, Meagher & Flom',
    avatarSeed: 'subvet-tenant-taylor',
  },
  {
    id: 'casey-wright',
    displayName: 'Casey Wright',
    age: 21,
    neighborhoods: 'Williamsburg, Greenpoint',
    subleaseWindow: 'May 28 – Aug 25, 2026',
    budget: '$1,000–1,250/mo',
    intro:
      'Design intern; portfolio work from home two days a week. Plant parent, no pets traveling with me.',
    ideal: 'Rooftop or courtyard a plus, tolerant of light music during daytime work blocks.',
    questions: 'Roof access rules? Window AC allowed?',
    company: 'IDEO',
    avatarSeed: 'subvet-tenant-casey',
  },
  {
    id: 'morgan-ba',
    displayName: 'Morgan Ba',
    age: 24,
    neighborhoods: 'Jersey City, Journal Square',
    subleaseWindow: 'Jun 1 – Aug 31, 2026',
    budget: '$800–1,000/mo',
    intro:
      'Commuting to Manhattan daily; fine with PATH or ferry-heavy commute if the rent and space trade off works.',
    ideal: 'Clean building, gym nice-to-have, open to studio or private room.',
    questions: 'PATH peak crowding reality from this block? Broker fee already paid?',
    company: 'JPMorgan Chase',
    avatarSeed: 'subvet-tenant-morgan',
  },
]

export function getTenantById(id) {
  return TENANTS.find((t) => t.id === id)
}
