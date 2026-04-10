const path = require('node:path')
const express = require('express')
const cors = require('cors')
const seedListings = require('./listingsData')
const seedTenants = require('./tenantsData')
const initialListings = require('./listingsData')
const tenants = require('./tenantsData')

const app = express()

/** In-memory listings (GET/POST can mutate; seed from mock data module) */
let listings = [...initialListings]

app.use(cors())
app.use(express.json())

let listings = seedListings.map((listing) => ({ ...listing }))
let tenants = seedTenants.map((tenant) => ({ ...tenant }))
let users = [
  {
    id: 'demo',
    name: 'Kaiyuan Wu',
    email: 'demo@subvet.app',
    password: 'password123',
  },
]
let applications = []
let contactRequests = []

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
app.post('/api/listings', (req, res) => {
  const { name, location, price, rating, details, description, owner } = req.body
  if (!name || !location || !price) {
    return res.status(400).json({ error: 'name, location, and price are required' })
  }
  return res.json(listing)
})

app.post('/api/listings', (req, res) => {
  const {
    name,
    location,
    price,
    rating,
    details,
    description,
    owner,
    bhk,
    area,
    rentUsd,
    mapQuery,
  } = req.body ?? {}

  if (!name || !location || !price) {
    return badRequest(res, 'name, location, and price are required')
    rating: typeof rating === 'number' ? String(rating) : rating ?? '4.0',
    details: details || 'Details',
    description: description || 'No description provided yet.',
    owner: owner || 'Unknown',
    bhk: '1',
    area: location,
    rentUsd: 1000,
    mapQuery: `${location}, New York, NY`,
  }

  const nextId = nextNumericId(listings)
  const normalizedRent = Number(rentUsd)
  const listing = {
    id: nextId,
    name: String(name).trim(),
    location: String(location).trim(),
    price: String(price).trim(),
    rating:
      typeof rating === 'number' || typeof rating === 'string'
        ? String(rating)
        : '4.5',
    details: details ? String(details).trim() : 'Private room · shared unit',
    description: description ? String(description).trim() : 'No description provided yet.',
    owner: owner ? String(owner).trim() : 'Kaiyuan Wu',
    bhk: bhk ? String(bhk) : 'room',
    area: area ? String(area).trim() : String(location).trim(),
    rentUsd: Number.isFinite(normalizedRent) ? normalizedRent : null,
    mapQuery: mapQuery ? String(mapQuery).trim() : `${String(location).trim()}, New York, NY`,
  }

  listings.push(listing)
  return res.status(201).json(listing)
})

app.get('/api/listings/:id', (req, res) => {
  const id = Number(req.params.id)
  const listing = listings.find((l) => l.id === id)

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  res.json(listing)
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

  const nextId = String(nextNumericId(tenants))
  const tenant = {
    id: nextId,
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
    avatarSeed: `subvet-tenant-${nextId}`,
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
    {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      password,
    }

  if (!existing) {
    users.push(user)
  }

  return res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  })
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

  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
  }

  users.push(user)
  return res.status(201).json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  })
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
