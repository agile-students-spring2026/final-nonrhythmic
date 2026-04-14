const path = require('node:path')
const express = require('express')
const cors = require('cors')
const seedListings = require('./listingsData')
const seedTenants = require('./tenantsData')

const app = express()

app.use(cors())
app.use(express.json())

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarSeed: user.avatarSeed,
  }
}

function defaultBio(name) {
  return `${name} is looking for a clean and safe place near campus with good transit access.`
}

function buildUser({ id, name, email, password, bio, avatarSeed }) {
  return {
    id,
    name,
    email,
    password,
    bio: bio || defaultBio(name),
    avatarSeed: avatarSeed || `subvet-user-${id}`,
  }
}

let users = [
  buildUser({
    id: 'demo',
    name: 'Kaiyuan Wu',
    email: 'demo@subvet.app',
    password: 'password123',
    bio: 'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
    avatarSeed: 'subvet-profile-demo',
  }),
]

let listings = seedListings.map((listing, index) => ({
  ...listing,
  ownerId: index < 2 ? 'demo' : null,
  owner: index < 2 ? 'Kaiyuan Wu' : 'Other User',
}))

let tenants = seedTenants.map((tenant) => ({ ...tenant }))
let applications = []
let contactRequests = []
let savedListings = [{ userId: 'demo', listingId: 1 }]

function badRequest(res, message) {
  return res.status(400).json({ error: message })
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase()
}

function findUserById(userId) {
  return users.find((user) => user.id === String(userId))
}

function nextNumericId(items) {
  return items.length > 0 ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1
}

function nextUserId() {
  return `user-${Date.now()}`
}

function normalizeListingOwner({ ownerId, owner }) {
  if (!ownerId) {
    return {
      ownerId: null,
      owner: owner ? String(owner).trim() : 'Kaiyuan Wu',
    }
  }

  const user = findUserById(ownerId)
  if (!user) return null

  return {
    ownerId: user.id,
    owner: owner ? String(owner).trim() : user.name,
  }
}

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/listings', (req, res) => {
  res.json(listings)
})

app.get('/api/listings/:id', (req, res) => {
  const id = Number(req.params.id)
  const listing = listings.find((item) => item.id === id)

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  return res.json(listing)
})

app.get('/api/users/:id/saved-listings', (req, res) => {
  const userId = String(req.params.id)

  const savedIds = savedListings
    .filter((item) => item.userId === userId)
    .map((item) => item.listingId)

  const saved = listings.filter((listing) => savedIds.includes(listing.id))

  res.json(saved)
})

app.post('/api/users/:id/saved-listings', (req, res) => {
  const userId = String(req.params.id)
  const listingId = Number(req.body.listingId)

  if (!listingId) {
    return res.status(400).json({ error: 'listingId is required' })
  }

  const listing = listings.find((item) => item.id === listingId)
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  const alreadySaved = savedListings.some(
    (item) => item.userId === userId && item.listingId === listingId
  )

  if (alreadySaved) {
    return res.status(200).json({ ok: true, message: 'Already saved' })
  }

  savedListings.push({ userId, listingId })
  res.status(201).json({ ok: true })
})

app.delete('/api/users/:id/saved-listings/:listingId', (req, res) => {
  const userId = String(req.params.id)
  const listingId = Number(req.params.listingId)

  const before = savedListings.length
  savedListings = savedListings.filter(
    (item) => !(item.userId === userId && item.listingId === listingId)
  )

  if (savedListings.length === before) {
    return res.status(404).json({ error: 'Saved listing not found' })
  }

  res.json({ ok: true })
})

app.post('/api/listings', (req, res) => {
  const {
    name,
    location,
    price,
    rating,
    reviewCount,
    details,
    description,
    owner,
    ownerId,
    bhk,
    area,
    rentUsd,
    mapQuery,
  } = req.body ?? {}

  if (!name || !location || !price) {
    return badRequest(res, 'name, location, and price are required')
  }

  const normalizedOwner = normalizeListingOwner({
    ownerId: ownerId ? String(ownerId) : null,
    owner,
  })

  if (ownerId && !normalizedOwner) {
    return res.status(404).json({ error: 'User not found' })
  }

  const normalizedRent = Number(rentUsd)
  const listing = {
    id: nextNumericId(listings),
    name: String(name).trim(),
    location: String(location).trim(),
    price: String(price).trim(),
    rating:
      typeof rating === 'number' || typeof rating === 'string'
        ? String(rating)
        : null,
    reviewCount: Number.isFinite(Number(reviewCount)) ? Math.max(0, Number(reviewCount)) : 0,
    details: details ? String(details).trim() : 'Private room · shared unit',
    description: description ? String(description).trim() : 'No description provided yet.',
    owner: normalizedOwner?.owner ?? 'Kaiyuan Wu',
    ownerId: normalizedOwner?.ownerId ?? null,
    bhk: bhk ? String(bhk) : 'room',
    area: area ? String(area).trim() : String(location).trim(),
    rentUsd: Number.isFinite(normalizedRent) ? normalizedRent : null,
    mapQuery: mapQuery ? String(mapQuery).trim() : `${String(location).trim()}, New York, NY`,
  }

  listings.push(listing)
  return res.status(201).json(listing)
})

app.get('/api/tenants', (req, res) => {
  res.json(tenants)
})

app.get('/api/tenants/:id', (req, res) => {
  const tenant = tenants.find((item) => item.id === String(req.params.id))

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' })
  }

  return res.json(tenant)
})

app.post('/api/tenants', (req, res) => {
  const {
    displayName,
    age,
    neighborhoods,
    subleaseWindow,
    budget,
    intro,
    ideal,
    questions,
    company,
  } = req.body ?? {}

  if (!displayName || !age || !neighborhoods || !subleaseWindow) {
    return badRequest(res, 'displayName, age, neighborhoods, and subleaseWindow are required')
  }

  const tenant = {
    id: String(nextNumericId(tenants)),
    displayName: String(displayName).trim(),
    age: Number(age),
    neighborhoods: String(neighborhoods).trim(),
    subleaseWindow: String(subleaseWindow).trim(),
    budget: budget ? String(budget).trim() : '$0/mo',
    intro: intro
      ? String(intro).trim()
      : `${String(displayName).trim()} is looking for a summer sublease with reliable transit access.`,
    ideal: ideal
      ? String(ideal).trim()
      : 'Furnished or lightly furnished, respectful roommates if shared.',
    questions: questions ? String(questions).trim() : 'No questions yet.',
    company: company ? String(company).trim() : 'Summer internship',
    avatarSeed: `subvet-tenant-${nextNumericId(tenants)}`,
  }

  tenants.push(tenant)
  return res.status(201).json(tenant)
})

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return badRequest(res, 'email and password are required')
  }

  const existing = users.find((user) => user.email === email)
  if (existing && existing.password !== password) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const user =
    existing ??
    buildUser({
      id: nextUserId(),
      name: email.split('@')[0] || 'User',
      email,
      password,
    })

  if (!existing) {
    users.push(user)
  }

  return res.json({ ok: true, user: publicUser(user) })
})

app.post('/api/auth/register', (req, res) => {
  const name = String(req.body?.name ?? '').trim()
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password ?? '')

  if (!name || !email || !password) {
    return badRequest(res, 'name, email, and password are required')
  }

  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const user = buildUser({
    id: nextUserId(),
    name,
    email,
    password,
  })

  users.push(user)
  return res.status(201).json({ ok: true, user: publicUser(user) })
})

app.get('/api/users/:id', (req, res) => {
  const user = findUserById(req.params.id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json(publicUser(user))
})



app.patch('/api/users/:id', (req, res) => {
  const user = findUserById(req.params.id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const incoming = req.body ?? {}
  const nextName =
    incoming.name === undefined ? user.name : String(incoming.name).trim()
  const nextBio = incoming.bio === undefined ? user.bio : String(incoming.bio).trim()
  const nextAvatarSeed =
    incoming.avatarSeed === undefined
      ? user.avatarSeed
      : String(incoming.avatarSeed).trim()

  if (!nextName) {
    return badRequest(res, 'name cannot be empty')
  }

  if (!nextBio) {
    return badRequest(res, 'bio cannot be empty')
  }

  if (!nextAvatarSeed) {
    return badRequest(res, 'avatarSeed cannot be empty')
  }

  const previousName = user.name
  user.name = nextName
  user.bio = nextBio
  user.avatarSeed = nextAvatarSeed

  listings = listings.map((listing) => {
    if (listing.ownerId === user.id) {
      return { ...listing, owner: user.name }
    }

    if (!listing.ownerId && listing.owner === previousName) {
      return { ...listing, owner: user.name }
    }

    return listing
  })

  return res.json(publicUser(user))
})

app.post('/api/applications', (req, res) => {
  const listingId = Number(req.body?.listingId)
  const userId = String(req.body?.userId ?? '')
  const listing = listings.find((item) => item.id === listingId)
  const user = findUserById(userId)

  if (!Number.isFinite(listingId) || !userId) {
    return badRequest(res, 'listingId and userId are required')
  }

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const application = {
    id: `app-${Date.now()}`,
    listingId,
    userId,
    createdAt: new Date().toISOString(),
  }

  applications.push(application)
  return res.status(201).json({ ok: true, application })
})

app.post('/api/contact-requests', (req, res) => {
  const targetType = String(req.body?.targetType ?? '')
  const targetId = String(req.body?.targetId ?? '')
  const userId = String(req.body?.userId ?? '')

  if (!targetType || !targetId || !userId) {
    return badRequest(res, 'targetType, targetId, and userId are required')
  }

  if (!findUserById(userId)) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (targetType === 'listing') {
    const listing = listings.find((item) => item.id === Number(targetId))
    if (!listing) return res.status(404).json({ error: 'Listing not found' })
  } else if (targetType === 'tenant') {
    const tenant = tenants.find((item) => item.id === targetId)
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
  } else {
    return badRequest(res, 'targetType must be "listing" or "tenant"')
  }

  const contactRequest = {
    id: `contact-${Date.now()}`,
    targetType,
    targetId,
    userId,
    createdAt: new Date().toISOString(),
  }

  contactRequests.push(contactRequest)
  return res.status(201).json({ ok: true, contactRequest })
})

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error' })
})

module.exports = app
