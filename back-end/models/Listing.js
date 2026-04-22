const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    rating: { type: Number, default: 4.0 },
    details: { type: String, default: 'Details' },
    description: { type: String, default: '' },
    owner: { type: String, default: '' },
    ownerId: { type: String, default: '' },
    bhk: { type: Number, default: 0 },
    area: { type: String, default: '' },
    rentUsd: { type: Number, default: 0 },
    mapQuery: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Listing', listingSchema)
