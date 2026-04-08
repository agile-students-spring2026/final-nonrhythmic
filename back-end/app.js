const express = require('express')
const cors = require('cors')
const listings = require('./listingsData')
const tenants = require('./tenantsData')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.get('/api/listings', (req, res) => {
  res.json(listings)
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error' })
})


module.exports = app

