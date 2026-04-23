const path = require('node:path')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, param, validationResult } = require('express-validator')
const seedListings = require('./listingsData')
const seedTenants = require('./tenantsData')
const Application = require('./models/Application')
const ContactRequest = require('./models/ContactRequest')
const Listing = require('./models/Listing')
const SavedListing = require('./models/SavedListing')
const Tenant = require('./models/Tenant')
const User = require('./models/User')

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

function buildUserDoc({ id, name, email, passwordHash, bio, avatarSeed }) {
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

function badRequest(res, message) {
  return res.status(400).json({ error: message })
}

function hasText(value) {
  if (value === undefined || value === null) return false
  return String(value).trim() !== ''
}

function sanitizeText(value) {
  return String(value).trim()
}

function requiredTextBody(field, message = `${field} is required`) {
  return body(field)
    .custom((value) => hasText(value))
    .withMessage(message)
    .bail()
    .customSanitizer(sanitizeText)
}

function optionalTextBody(field, message = `${field} cannot be empty`) {
  return body(field)
    .optional({ values: 'undefined' })
    .custom((value) => hasText(value))
    .withMessage(message)
    .bail()
    .customSanitizer(sanitizeText)
}

function requiredTextParam(field, message = `${field} is required`) {
  return param(field)
    .custom((value) => hasText(value))
    .withMessage(message)
    .bail()
    .customSanitizer(sanitizeText)
}

function handleValidationErrors(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    return next()
  }

  return badRequest(res, result.array({ onlyFirstError: true })[0].msg)
}

function validate(rules) {
  return [...rules, handleValidationErrors]
}

const userIdParamValidation = validate([requiredTextParam('id', 'userId is required')])
const listingIdParamValidation = validate([
  param('listingId')
    .isInt({ min: 1 })
    .withMessage('listingId must be a positive integer')
    .toInt(),
])

const createListingValidation = validate([
  requiredTextBody('name'),
  requiredTextBody('location'),
  requiredTextBody('price'),
  optionalTextBody('owner'),
  optionalTextBody('ownerId'),
  optionalTextBody('details'),
  optionalTextBody('description'),
  optionalTextBody('bhk'),
  optionalTextBody('area'),
  optionalTextBody('mapQuery'),
  body('rating')
    .optional({ values: 'undefined' })
    .custom((value) => hasText(value))
    .withMessage('rating cannot be empty')
    .bail()
    .customSanitizer(sanitizeText),
  body('reviewCount')
    .optional({ values: 'undefined' })
    .isInt({ min: 0 })
    .withMessage('reviewCount must be a non-negative integer')
    .toInt(),
  body('rentUsd')
    .optional({ values: 'undefined' })
    .isFloat({ min: 0 })
    .withMessage('rentUsd must be a non-negative number')
    .toFloat(),
])

const createTenantValidation = validate([
  requiredTextBody('displayName'),
  body('age')
    .custom((value) => hasText(value))
    .withMessage('age is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('age must be a positive integer')
    .toInt(),
  requiredTextBody('neighborhoods'),
  requiredTextBody('subleaseWindow'),
  optionalTextBody('budget'),
  optionalTextBody('intro'),
  optionalTextBody('ideal'),
  optionalTextBody('questions'),
  optionalTextBody('company'),
])

const loginValidation = validate([
  requiredTextBody('email'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  requiredTextBody('password'),
])

const registerValidation = validate([
  requiredTextBody('name'),
  requiredTextBody('email'),
  body('email').isEmail().withMessage('email must be valid').normalizeEmail(),
  requiredTextBody('password'),
])

const updateUserValidation = validate([
  optionalTextBody('name', 'name cannot be empty'),
  optionalTextBody('bio', 'bio cannot be empty'),
  optionalTextBody('avatarSeed', 'avatarSeed cannot be empty'),
])

const applicationValidation = validate([
  body('listingId')
    .custom((value) => hasText(value))
    .withMessage('listingId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('listingId must be a positive integer')
    .toInt(),
  requiredTextBody('userId'),
])

const contactRequestValidation = validate([
  body('targetType')
    .custom((value) => hasText(value))
    .withMessage('targetType is required')
    .bail()
    .isIn(['listing', 'tenant'])
    .withMessage('targetType must be "listing" or "tenant"')
    .customSanitizer(sanitizeText),
  requiredTextBody('targetId'),
  body('targetId').custom((value, { req }) => {
    if (req.body?.targetType !== 'listing') return true

    const numericTargetId = Number(value)
    if (!Number.isInteger(numericTargetId) || numericTargetId < 1) {
      throw new Error('targetId must be a positive integer for listing requests')
    }

    return true
  }),
  requiredTextBody('userId'),
])

const saveListingValidation = validate([
  body('listingId')
    .custom((value) => hasText(value))
    .withMessage('listingId is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('listingId must be a positive integer')
    .toInt(),
])

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

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase()
}

async function findUserById(userId) {
  return User.findOne({ id: String(userId) })
}

function nextUserId() {
  return `user-${Date.now()}`
}

async function nextTenantId() {
  const last = await Tenant.findOne().sort({ createdAt: -1 }).lean()
  if (!last) return '1'

  const allIds = await Tenant.find({}, { id: 1 }).lean()
  const max = allIds.reduce((acc, item) => {
    const n = Number(item.id)
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)

  return String(max + 1)
}

async function normalizeListingOwner({ ownerId, owner }) {
  if (!ownerId) {
    return {
      ownerId: null,
      owner: owner ? String(owner).trim() : 'Kaiyuan Wu',
    }
  }

  const user = await findUserById(ownerId)
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
    reviewCount:
      Number.isFinite(Number(listing.reviewCount)) ? Math.max(0, Number(listing.reviewCount)) : 0,
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

async function ensureUsersSeeded() {
  const exists = await User.findOne({ id: 'demo' })
  if (exists) return

  const passwordHash = await bcrypt.hash('password123', PASSWORD_SALT_ROUNDS)
  await User.create(
    buildUserDoc({
      id: 'demo',
      name: 'Kaiyuan Wu',
      email: 'demo@subvet.app',
      passwordHash,
      bio: 'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
      avatarSeed: 'subvet-profile-demo',
    }),
  )
}

async function ensureTenantsSeeded() {
  const count = await Tenant.countDocuments()
  if (count > 0) return

  const docs = seedTenants.map((tenant) => ({ ...tenant }))
  if (docs.length > 0) {
    await Tenant.insertMany(docs)
  }
}

async function ensureSavedListingsSeeded() {
  const count = await SavedListing.countDocuments()
  if (count > 0) return

  const demoUser = await User.findOne({ id: 'demo' }).lean()
  const demoListing = await Listing.findOne({ id: 1 }).lean()

  if (!demoUser || !demoListing) return

  await SavedListing.create({ userId: demoUser.id, listingId: demoListing.id })
}

async function ensureSeedData() {
  await ensureUsersSeeded()
  await ensureListingsSeeded()
  await ensureTenantsSeeded()
  await ensureSavedListingsSeeded()
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

app.get(
  '/api/users/:id/saved-listings',
  requireAuth,
  userIdParamValidation,
  requireAuthForUserParam,
  async (req, res) => {
    try {
      const userId = String(req.params.id)
      const savedItems = await SavedListing.find({ userId }).sort({ createdAt: 1 }).lean()
      const savedIds = savedItems.map((item) => item.listingId)
      const saved = await Listing.find({ id: { $in: savedIds } }).sort({ id: 1 }).lean()

      res.json(saved)
    } catch {
      res.status(500).json({ error: 'Failed to load saved listings' })
    }
  },
)

app.post(
  '/api/users/:id/saved-listings',
  requireAuth,
  userIdParamValidation,
  requireAuthForUserParam,
  saveListingValidation,
  async (req, res) => {
    try {
      const userId = String(req.params.id)
      const listingId = Number(req.body.listingId)

      const listing = await Listing.findOne({ id: listingId }).lean()
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' })
      }

      const alreadySaved = await SavedListing.findOne({ userId, listingId }).lean()
      if (alreadySaved) {
        return res.status(200).json({ ok: true, message: 'Already saved' })
      }

      await SavedListing.create({ userId, listingId })
      return res.status(201).json({ ok: true })
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(200).json({ ok: true, message: 'Already saved' })
      }
      return res.status(500).json({ error: 'Failed to save listing' })
    }
  },
)

app.delete(
  '/api/users/:id/saved-listings/:listingId',
  requireAuth,
  userIdParamValidation,
  listingIdParamValidation,
  requireAuthForUserParam,
  async (req, res) => {
    try {
      const userId = String(req.params.id)
      const listingId = Number(req.params.listingId)

      const deleted = await SavedListing.findOneAndDelete({ userId, listingId })
      if (!deleted) {
        return res.status(404).json({ error: 'Saved listing not found' })
      }

      return res.json({ ok: true })
    } catch {
      return res.status(500).json({ error: 'Failed to remove saved listing' })
    }
  },
)

app.post('/api/listings', createListingValidation, async (req, res) => {
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

    const normalizedOwner = await normalizeListingOwner({
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

app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ id: 1 }).lean()
    res.json(tenants)
  } catch {
    res.status(500).json({ error: 'Failed to load tenants' })
  }
})

app.get('/api/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ id: String(req.params.id) }).lean()

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' })
    }

    return res.json(tenant)
  } catch {
    return res.status(500).json({ error: 'Failed to load tenant' })
  }
})

app.post('/api/tenants', createTenantValidation, async (req, res) => {
  try {
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

    const id = await nextTenantId()
    const tenant = await Tenant.create({
      id,
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
      avatarSeed: `subvet-tenant-${id}`,
    })

    return res.status(201).json(tenant)
  } catch {
    return res.status(500).json({ error: 'Failed to create tenant' })
  }
})

app.post('/api/auth/login', loginValidation, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password ?? '')

    const existing = await User.findOne({ email })
    if (existing) {
      const isValidPassword = await bcrypt.compare(password, existing.passwordHash)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Incorrect password' })
      }
      return res.json({ ok: true, user: publicUser(existing), token: signAuthToken(existing) })
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)
    const user = await User.create(
      buildUserDoc({
        id: nextUserId(),
        name: email.split('@')[0] || 'User',
        email,
        passwordHash,
      }),
    )

    return res.json({ ok: true, user: publicUser(user), token: signAuthToken(user) })
  } catch {
    return res.status(500).json({ error: 'Failed to log in' })
  }
})

app.post('/api/auth/register', registerValidation, async (req, res) => {
  try {
    const name = String(req.body?.name ?? '').trim()
    const email = normalizeEmail(req.body?.email)
    const password = String(req.body?.password ?? '')

    const duplicate = await User.findOne({ email })
    if (duplicate) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS)
    const user = await User.create(
      buildUserDoc({
        id: nextUserId(),
        name,
        email,
        passwordHash,
      }),
    )

    return res.status(201).json({ ok: true, user: publicUser(user), token: signAuthToken(user) })
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }
    return res.status(500).json({ error: 'Failed to register' })
  }
})

app.get('/api/users/:id', userIdParamValidation, async (req, res) => {
  try {
    const user = await findUserById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json(publicUser(user))
  } catch {
    return res.status(500).json({ error: 'Failed to load user' })
  }
})

app.patch(
  '/api/users/:id',
  requireAuth,
  userIdParamValidation,
  requireAuthForUserParam,
  updateUserValidation,
  async (req, res) => {
    try {
      const user = await findUserById(req.params.id)

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const incoming = req.body ?? {}
      const nextName = incoming.name === undefined ? user.name : String(incoming.name).trim()
      const nextBio = incoming.bio === undefined ? user.bio : String(incoming.bio).trim()
      const nextAvatarSeed =
        incoming.avatarSeed === undefined
          ? user.avatarSeed
          : String(incoming.avatarSeed).trim()

      const previousName = user.name
      user.name = nextName
      user.bio = nextBio
      user.avatarSeed = nextAvatarSeed
      await user.save()

      await Listing.updateMany({ ownerId: user.id }, { $set: { owner: user.name } })

      await Listing.updateMany(
        { $or: [{ ownerId: null }, { ownerId: '' }], owner: previousName },
        { $set: { owner: user.name } },
      )

      return res.json(publicUser(user))
    } catch {
      return res.status(500).json({ error: 'Failed to update profile' })
    }
  },
)

app.post('/api/applications', requireAuth, applicationValidation, async (req, res) => {
  try {
    const listingId = Number(req.body?.listingId)
    const userId = String(req.body?.userId ?? '')

    if (req.auth?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden for this user' })
    }

    const listing = await Listing.findOne({ id: listingId }).lean()
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const application = await Application.create({
      id: `app-${Date.now()}`,
      listingId,
      userId,
    })

    return res.status(201).json({
      ok: true,
      application: {
        id: application.id,
        listingId: application.listingId,
        userId: application.userId,
        createdAt: application.createdAt,
      },
    })
  } catch {
    return res.status(500).json({ error: 'Failed to submit application' })
  }
})

app.post('/api/contact-requests', requireAuth, contactRequestValidation, async (req, res) => {
  try {
    const targetType = String(req.body?.targetType ?? '')
    const targetId = String(req.body?.targetId ?? '')
    const userId = String(req.body?.userId ?? '')

    if (req.auth?.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden for this user' })
    }

    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (targetType === 'listing') {
      const listing = await Listing.findOne({ id: Number(targetId) }).lean()
      if (!listing) return res.status(404).json({ error: 'Listing not found' })
    } else {
      const tenant = await Tenant.findOne({ id: targetId }).lean()
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
    }

    const contactRequest = await ContactRequest.create({
      id: `contact-${Date.now()}`,
      targetType,
      targetId,
      userId,
    })

    return res.status(201).json({
      ok: true,
      contactRequest: {
        id: contactRequest.id,
        targetType: contactRequest.targetType,
        targetId: contactRequest.targetId,
        userId: contactRequest.userId,
        createdAt: contactRequest.createdAt,
      },
    })
  } catch {
    return res.status(500).json({ error: 'Failed to submit contact request' })
  }
})

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error' })
})

ensureSeedData().catch((err) => {
  console.error('Failed to seed database:', err)
})

module.exports = app
