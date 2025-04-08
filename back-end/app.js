const path = require('path')
const express = require('express')
const cors = require('cors')
const listings = require('./listingsData')
const tenants = require('./tenantsData')
const {
  parseRentUsd,
  normalizeRating,
  mapQueryForLocation,
} = require('./lib/listingHelpers')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/listings', (req, res) => {
  res.json(listings)
})

app.post('/api/listings', (req, res) => {
  const { name, location, price, rating, details, description, owner } = req.body

  if (!name || !location || !price) {
    return res.status(400).json({ error: 'name, location, and price are required' })
  }

  const nextId = listings.length > 0 ? Math.max(...listings.map((l) => l.id)) + 1 : 1

  const rentUsd = parseRentUsd(price)
  const area = String(location).split(',')[0].trim() || String(location).trim()

  const newListing = {
    id: nextId,
    name: String(name).trim(),
    location: String(location).trim(),
    price: String(price).trim(),
    rating: normalizeRating(rating),
    details: details ? String(details).trim() : 'Details',
    description: description
      ? String(description).trim()
      : 'No description provided yet.',
    owner: owner ? String(owner).trim() : 'Unknown',
    bhk: '1',
    area,
    rentUsd,
    mapQuery: mapQueryForLocation(location),
  }

  listings.push(newListing)
  res.status(201).json(newListing)
})

app.get('/api/listings/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid listing id' })
  }
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
  const tenant = tenants.find((t) => t.id === String(req.params.id))
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' })
  res.json(tenant)
})

app.post('/api/auth/login', (req, res) => {
  res.json({ ok: true, user: { id: 'demo', email: req.body?.email ?? null } })
})

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ ok: true, user: { id: 'demo', email: req.body?.email ?? null } })
})

app.post('/api/applications', (req, res) => {
  res.status(201).json({ ok: true })
})

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error' })
})

module.exports = app
