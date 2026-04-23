const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    listingId: { type: Number, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Application', applicationSchema)
