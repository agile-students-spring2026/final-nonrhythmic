const mongoose = require('mongoose')

const savedListingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    listingId: { type: Number, required: true, index: true },
  },
  { timestamps: true },
)

savedListingSchema.index({ userId: 1, listingId: 1 }, { unique: true })

module.exports = mongoose.model('SavedListing', savedListingSchema)
