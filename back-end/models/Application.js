const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    listingId: { type: Number, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

applicationSchema.index({ listingId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Application', applicationSchema)
