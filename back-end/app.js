import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

let listings = [
  {
    id: 1,
    name: 'NYC Apartment',
    location: 'Manhattan',
    price: '$1200/month',
    rating: 4.7,
    details: 'Details',
    description: 'Spacious Manhattan apartment close to campus and transit.',
    owner: 'Kaiyuan Wu',
  },
  {
    id: 2,
    name: 'Brooklyn Room',
    location: 'Brooklyn',
    price: '$900/month',
    rating: 4.5,
    details: 'Details',
    description: 'Cozy Brooklyn room in a quiet neighborhood.',
    owner: 'Kaiyuan Wu',
  },
  {
    id: 3,
    name: 'Queens Studio',
    location: 'Queens',
    price: '$1100/month',
    rating: 4.6,
    details: 'Details',
    description: 'Private studio with easy subway access.',
    owner: 'Other User',
  },
]

let profile = {
  username: 'Kaiyuan Wu',
  bio: 'Hi, I am looking for a clean and safe place near campus. I prefer a quiet environment and easy access to public transportation.',
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/listings', (_req, res) => {
  res.json(listings)
})

app.get('/api/listings/:id', (req, res) => {
  const listing = listings.find((item) => item.id === Number(req.params.id))
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' })
  }
  res.json(listing)
})

app.post('/api/listings', (req, res) => {
  const { name, location, price, rating, details, description, owner } = req.body

  if (!name || !location || !price) {
    return res.status(400).json({ error: 'name, location, and price are required' })
  }

  const nextId = listings.length ? Math.max(...listings.map((item) => item.id)) + 1 : 1

  const newListing = {
    id: nextId,
    name,
    location,
    price,
    rating: Number(rating) || 4.5,
    details: details || 'Details',
    description: description || 'No description provided.',
    owner: owner || 'Kaiyuan Wu',
  }

  listings.push(newListing)
  res.status(201).json(newListing)
})

app.get('/api/profile', (_req, res) => {
  res.json(profile)
})

app.put('/api/profile', (req, res) => {
  const { username, bio } = req.body
  if (typeof username === 'string' && username.trim()) {
    profile.username = username.trim()
  }
  if (typeof bio === 'string') {
    profile.bio = bio
  }
  res.json(profile)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
