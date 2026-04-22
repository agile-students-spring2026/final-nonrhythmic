const path = require('node:path')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const seedListings = require('./listingsData')
const seedTenants = require('./tenantsData')
const Listing = require('./models/Listing')

const app = express()

app.use(cors())
app.use(express.json())

const PASSWORD_SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'

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

function buildUser({ id, name, email, passwordHash, bio, avatarSeed }) {
  return {
    id,
    name,
    email,
    passwordHash,
    bio: bio || defaultBio(name),
    avatarSeed: avatarSeed || `subvet-user-${id}`,
  }
}

function signAuthToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

function requireAuth(req, res, next) {
  const authHeader = String(req.headers.authorization ?? '')
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token is required' })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.auth = { userId: String(payload.sub ?? '') }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

function requireAuthForUserParam(req, res, next) {
  const requestedUserId = String(req.params.id)
  if (req.auth?.userId !== requestedUserId) {
    return res.status(403).json({ error: 'Forbidden for this user' })
  }
  return next()
}

let users = [
  buildUser({
    id: 'demo',
    name: 'Kaiyuan Wu',
    email: 'demo@subvet.app',
    passwordHash: bcrypt.hashSync('password123', PASSWORD_SALT_ROUNDS),
    bio: 'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
    avatarSeed: 'subvet-profile-demo',
  }),
]

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

async function nextListingId() {
  const last = await Listing.findOne().sort({ id: -1 }).lean()
  return last?.id ? Number(last.id) + 1 : 1
}

async function ensureListingsSeeded() {
  const count = await Listing.countDocuments()
  if (count > 0) return

  const docs = seedListings.map((listing, index) => ({
    id: index + 1,
    name: listing.name,
    location: listing.location,
    price: listing.price,
    rating:
      typeof listing.rating === 'number' || typeof listing.rating === 'string'
        ? String(listing.rating)
        : null,
    reviewCount: Number.isFinite(Number(listing.reviewCount)) ? Math.max(0, Number(listing.reviewCount)) : 0,
    details: listing.details || 'Private room · shared unit',
    description: listing.description || 'No description provided yet.',
    ownerId: index < 2 ? 'demo' : null,
    owner: index < 2 ? 'Kaiyuan Wu' : 'Other User',
    bhk: listing.bhk ? String(listing.bhk) : 'room',
    area: listing.area ? String(listing.area).trim() : String(listing.location).trim(),
    rentUsd: Number.isFinite(Number(listing.rentUsd)) ? Number(listing.rentUsd) : null,
    mapQuery: listing.mapQuery
      ? String(listing.mapQuery).trim()
      : `${String(listing.location).trim()}, New York, NY`,
  }))

  if (docs.length > 0) {
    await Listing.insertMany(docs)
  }
}

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ id: 1 }).lean()
    res.json(listings)
  } catch {
    res.status(500).json({ error: 'Failed to load listings' })
  }
})

app.get('/api/listings/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const listing = await Listing.findOne({ id }).lean()

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    return res.json(listing)
  } catch {
    return res.status(500).json({ error: 'Failed to load listing' })
  }
})

app.get('/api/users/:id/saved-listings', requireAuth, requireAuthForUserParam, async (req, res) => {
  try {
    const userId = String(req.params.id)

    const savedIds = savedListings
      .filter((item) => item.userId === userId)
      .map((item) => item.listingId)

    const saved = await Listing.find({ id: { $in: savedIds } }).sort({ id: 1 }).lean()

    res.json(saved)
  } catch {
    res.status(500).json({ error: 'Failed to load saved listings' })
  }
})

app.post('/api/users/:id/saved-listings', requireAuth, requireAuthForUserParam, async (req, res) => {
  try {
    const userId = String(req.params.id)
    const listingId = Number(req.body.listingId)

    if (!listingId) {
      return res.status(400).json({ error: 'listingId is required' })
    }

    const listing = await Listing.findOne({ id: listingId }).lean()
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
  } catch {
    res.status(500).json({ error: 'Failed to save listing' })
  }
})

app.delete('/api/users/:id/saved-listings/:listingId', requireAuth, requireAuthForUserParam, (req, res) => {
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

app.post('/api/listings', async (req, res) => {
  try {
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
    const listing = await Listing.create({
      id: await nextListingId(),
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
    })

    return res.status(201).json(listing)
  } catch {
    return res.status(500).json({ error: 'Failed to create listing' })
  }
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

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password ?? '')

  if (!email || !password) {
    return badRequest(res, 'email and password are required')
  }

  const existing = users.find((user) => user.email === email)
  if (existing) {
    const isValidPassword = await bcrypt.compare(password, existing.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' })
    }
    return res.json({ ok: true, user: publicUser(existing), token: signAuthToken(existing) })
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)
  const user = buildUser({
    id: nextUserId(),
    name: email.split('@')[0] || 'User',
    email,
    passwordHash,
  })
  users.push(user)

  return res.json({ ok: true, user: publicUser(user), token: signAuthToken(user) })
})

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.name ?? '').trim()
  const email = normalizeEmail(req.body?.email)
  const password = String(req.body?.password ?? '')

  if (!name || !email || !password) {
    return badRequest(res, 'name, email, and password are required')
  }

  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ error: 'An account with this email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)
  const user = buildUser({
    id: nextUserId(),
    name,
    email,
    passwordHash,
  })

  users.push(user)
  return res.status(201).json({ ok: true, user: publicUser(user), token: signAuthToken(user) })
})

app.get('/api/users/:id', (req, res) => {
  const user = findUserById(req.params.id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json(publicUser(user))
})

app.patch('/api/users/:id', requireAuth, requireAuthForUserParam, async (req, res) => {
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

  try {
    await Listing.updateMany(
      { ownerId: user.id },
      { $set: { owner: user.name } },
    )

    await Listing.updateMany(
      { $or: [{ ownerId: null }, { ownerId: '' }], owner: previousName },
      { $set: { owner: user.name } },
    )
  } catch {
    return res.status(500).json({ error: 'Failed to sync listing owner names' })
  }

  return res.json(publicUser(user))
})

app.post('/api/applications', requireAuth, async (req, res) => {
  const listingId = Number(req.body?.listingId)
  const userId = String(req.body?.userId ?? '')
  const user = findUserById(userId)

  if (!Number.isFinite(listingId) || !userId) {
    return badRequest(res, 'listingId and userId are required')
  }

  if (req.auth?.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden for this user' })
  }

  const listing = await Listing.findOne({ id: listingId }).lean()
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

app.post('/api/contact-requests', requireAuth, async (req, res) => {
  const targetType = String(req.body?.targetType ?? '')
  const targetId = String(req.body?.targetId ?? '')
  const userId = String(req.body?.userId ?? '')

  if (!targetType || !targetId || !userId) {
    return badRequest(res, 'targetType, targetId, and userId are required')
  }

  if (req.auth?.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden for this user' })
  }

  if (!findUserById(userId)) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (targetType === 'listing') {
    const listing = await Listing.findOne({ id: Number(targetId) }).lean()
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

ensureListingsSeeded().catch((err) => {
  console.error('Failed to seed listings:', err)
})

module.exports = app
