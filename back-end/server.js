require('dotenv').config()
const mongoose = require('mongoose')
const app = require('./app')

const PORT = Number(process.env.PORT) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env')
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in .env')
  process.exit(1)
}

// connect to MongoDB first
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB')

    const Application = require('./models/Application')
    try {
      await Application.syncIndexes()
    } catch (err) {
      console.warn(
        '⚠️ Application index sync failed (remove duplicate listingId+userId rows, then restart):',
        err.message,
      )
    }

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })