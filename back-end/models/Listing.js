const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    rating: { type: String, default: '4.0' },
    reviewCount: { type: Number, default: 0 },
    details: { type: String, default: 'Details' },
    description: { type: String, default: '' },
    owner: { type: String, default: '' },
    ownerId: { type: String, default: null },
    bhk: { type: String, default: 'room' },
    area: { type: String, default: '' },
    rentUsd: { type: Number, default: null },
    mapQuery: { type: String, default: '' },
    imageUrls: { type: [String], default: [] },
    proofUrls: { type: [String], default: [] },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Listing', listingSchema)