const path = require('node:path')
const fs = require('node:fs')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const { body, param, validationResult } = require('express-validator')
const seedListings = require('./listingsData')
const seedTenants = require('./tenantsData')
const Application = require('./models/Application')
const ContactRequest = require('./models/ContactRequest')
const Counter = require('./models/Counter')
const Listing = require('./models/Listing')
const Notification = require('./models/Notification')
const SavedListing = require('./models/SavedListing')
const Tenant = require('./models/Tenant')
const User = require('./models/User')

const app = express()

const UPLOAD_DIR = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.bin'
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
})

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(UPLOAD_DIR))

const PASSWORD_SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET

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

const notificationIdParamValidation = validate([
  requiredTextParam('notificationId', 'notificationId is required'),
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
  body('imageUrls').optional({ values: 'undefined' }).isArray().withMessage('imageUrls must be an array'),
  body('proofUrls').optional({ values: 'undefined' }).isArray().withMessage('proofUrls must be an array'),
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
  body('proofUrls').optional({ values: 'undefined' }).isArray().withMessage('proofUrls must be an array'),
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

function nextNotificationId() {
  return `note-${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

function sanitizeUploadUrls(value) {
  if (!Array.isArray(value)) return []
  return value.filter((u) => typeof u === 'string' && /^\/uploads\/[^/]+$/.test(u))
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

const TENANT_COUNTER_ID = 'tenant'

async function maxTenantIdFromDb() {
  const [row] = await Tenant.aggregate([
    {
      $addFields: {
        n: {
          $convert: { input: '$id', to: 'int', onError: null, onNull: null },
        },
      },
    },
    { $match: { n: { $ne: null } } },
    { $group: { _id: null, max: { $max: '$n' } } },
  ])
  return row?.max ?? 0
}

async function syncTenantIdCounter() {
  const max = await maxTenantIdFromDb()
  await Counter.findOneAndUpdate(
    { _id: TENANT_COUNTER_ID },
    { $set: { seq: max } },
    { upsert: true },
  )
}

/** Next tenant display id; counter must be synced (e.g. after seed) so it stays past existing rows. */
async function nextTenantId() {
  const updated = await Counter.findOneAndUpdate(
    { _id: TENANT_COUNTER_ID },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  )
  return String(updated.seq)
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
    owner: index < 2 ? 'User' : 'Other User',
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
      name: 'User',
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
  await syncTenantIdCounter()
}

app.ensureSeedData = ensureSeedData

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/listings', requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find().sort({ id: 1 }).lean()
    res.json(listings)
  } catch {
    res.status(500).json({ error: 'Failed to load listings' })
  }
})

app.get('/api/listings/:id', requireAuth, async (req, res) => {
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

app.delete('/api/listings/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id)

    const listing = await Listing.findOne({ id })
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' })
    }

    if (listing.ownerId !== req.auth.userId) {
      return res.status(403).json({ error: 'Only the owner can delete this listing' })
    }

    await Listing.deleteOne({ id })
    await SavedListing.deleteMany({ listingId: id })
    await Application.deleteMany({ listingId: id })
    await Notification.deleteMany({ listingId: id })

    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to delete listing' })
  }
})

app.get(
  '/api/users/:id/applications',
  requireAuth,
  userIdParamValidation,
  requireAuthForUserParam,
  async (req, res) => {
    try {
      const userId = String(req.params.id)

      const applications = await Application.find({ userId }).sort({ createdAt: -1 }).lean()
      const listingIds = applications.map((item) => item.listingId)

      const appliedListings = await Listing.find({ id: { $in: listingIds } }).sort({ id: 1 }).lean()

      return res.json(appliedListings)
    } catch {
      return res.status(500).json({ error: 'Failed to load applied listings' })
    }
  },
)

app.get(
  '/api/users/:id/notifications',
  requireAuth,
  userIdParamValidation,
  requireAuthForUserParam,
  async (req, res) => {
    try {
      const userId = String(req.params.id)
      const items = await Notification.find({ recipientUserId: userId }).sort({ createdAt: -1 }).lean()
      return res.json(items)
    } catch {
      return res.status(500).json({ error: 'Failed to load notifications' })
    }
  },
)

app.patch(
  '/api/users/:id/notifications/:notificationId/read',
  requireAuth,
  userIdParamValidation,
  notificationIdParamValidation,
  requireAuthForUserParam,
  async (req, res) => {
    try {
      const userId = String(req.params.id)
      const notificationId = String(req.params.notificationId)
      const doc = await Notification.findOneAndUpdate(
        { id: notificationId, recipientUserId: userId },
        { $set: { read: true } },
        { new: true },
      ).lean()
      if (!doc) {
        return res.status(404).json({ error: 'Notification not found' })
      }
      return res.json({ ok: true, notification: doc })
    } catch {
      return res.status(500).json({ error: 'Failed to update notification' })
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

app.post('/api/upload', requireAuth, upload.array('files', 15), (req, res) => {
  try {
    const files = req.files
    if (!files || files.length === 0) {
      return badRequest(res, 'No files uploaded')
    }

    const urls = files.map((f) => `/uploads/${f.filename}`)
    return res.status(201).json({ ok: true, urls })
  } catch {
    return res.status(500).json({ error: 'Failed to upload files' })
  }
})

app.post('/api/listings', requireAuth, createListingValidation, async (req, res) => {
  try {
    const ownerUser = await findUserById(req.auth.userId)
    if (!ownerUser) {
      return res.status(401).json({ error: 'User not found' })
    }

    const {
      name,
      location,
      price,
      rating,
      reviewCount,
      details,
      description,
      bhk,
      area,
      rentUsd,
      mapQuery,
      imageUrls: rawImageUrls,
      proofUrls: rawProofUrls,
    } = req.body ?? {}

    const imageUrls = sanitizeUploadUrls(rawImageUrls)
    const proofUrls = sanitizeUploadUrls(rawProofUrls)

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
      owner: ownerUser.name,
      ownerId: ownerUser.id,
      bhk: bhk ? String(bhk) : 'room',
      area: area ? String(area).trim() : String(location).trim(),
      rentUsd: Number.isFinite(normalizedRent) ? normalizedRent : null,
      mapQuery: mapQuery ? String(mapQuery).trim() : `${String(location).trim()}, New York, NY`,
      imageUrls,
      proofUrls,
    })

    return res.status(201).json(listing)
  } catch {
    return res.status(500).json({ error: 'Failed to create listing' })
  }
})

app.get('/api/tenants', requireAuth, async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ id: 1 }).lean()
    res.json(tenants)
  } catch {
    res.status(500).json({ error: 'Failed to load tenants' })
  }
})

app.get('/api/tenants/:id', requireAuth, async (req, res) => {
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

app.post('/api/tenants', requireAuth, createTenantValidation, async (req, res) => {
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
      proofUrls: rawProofUrls,
    } = req.body ?? {}

    const proofUrls = sanitizeUploadUrls(rawProofUrls)

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
      posterUserId: req.auth.userId,
      proofUrls,
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

    return res.status(401).json({ error: 'No account for this email. Please register first.' })
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

app.get('/api/users/:id', requireAuth, userIdParamValidation, async (req, res) => {
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

    const actor = await User.findOne({ id: userId }).lean()
    if (!actor) {
      return res.status(404).json({ error: 'User not found' })
    }

    const alreadyApplied = await Application.findOne({ listingId, userId }).lean()
    if (alreadyApplied) {
      return res.status(409).json({ error: 'You have already applied to this listing' })
    }

    const application = await Application.create({
      id: `app-${Date.now()}`,
      listingId,
      userId,
    })

    let notifiedOwner = false
    if (listing.ownerId && listing.ownerId !== userId) {
      await Notification.create({
        id: nextNotificationId(),
        recipientUserId: listing.ownerId,
        kind: 'listing_application',
        listingId: listing.id,
        listingName: listing.name || '',
        tenantId: null,
        tenantName: '',
        fromUserId: actor.id,
        fromUserName: actor.name,
        fromEmail: actor.email,
      })
      notifiedOwner = true
    }

    return res.status(201).json({
      ok: true,
      notifiedOwner,
      application: {
        id: application.id,
        listingId: application.listingId,
        userId: application.userId,
        createdAt: application.createdAt,
      },
    })
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'You have already applied to this listing' })
    }
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

    const actor = await User.findOne({ id: userId }).lean()
    if (!actor) {
      return res.status(404).json({ error: 'User not found' })
    }

    let notifiedOwner = false

    if (targetType === 'listing') {
      const listing = await Listing.findOne({ id: Number(targetId) }).lean()
      if (!listing) return res.status(404).json({ error: 'Listing not found' })

      if (listing.ownerId && listing.ownerId !== userId) {
        await Notification.create({
          id: nextNotificationId(),
          recipientUserId: listing.ownerId,
          kind: 'listing_contact',
          listingId: listing.id,
          listingName: listing.name || '',
          tenantId: null,
          tenantName: '',
          fromUserId: actor.id,
          fromUserName: actor.name,
          fromEmail: actor.email,
        })
        notifiedOwner = true
      }
    } else {
      const tenant = await Tenant.findOne({ id: targetId }).lean()
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' })

      if (tenant.posterUserId && tenant.posterUserId !== userId) {
        await Notification.create({
          id: nextNotificationId(),
          recipientUserId: tenant.posterUserId,
          kind: 'tenant_contact',
          listingId: null,
          listingName: '',
          tenantId: tenant.id,
          tenantName: tenant.displayName || '',
          fromUserId: actor.id,
          fromUserName: actor.name,
          fromEmail: actor.email,
        })
        notifiedOwner = true
      }
    }

    const contactRequest = await ContactRequest.create({
      id: `contact-${Date.now()}`,
      targetType,
      targetId,
      userId,
    })

    return res.status(201).json({
      ok: true,
      notifiedOwner,
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

module.exports = app
