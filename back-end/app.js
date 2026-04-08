const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const listings = require('./listingsData')

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'backend running',
  })
})

app.get('/api/listings', (req, res) => {
  res.json(listings)
})

app.get('/api/listings/:id', (req, res) => {
  const id = Number(req.params.id)
  const listing = listings.find(l => l.id === id)

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }

  res.json(listing)
})


module.exports = app