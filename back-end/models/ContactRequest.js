const mongoose = require('mongoose')

const contactRequestSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    targetType: { type: String, required: true, enum: ['listing', 'tenant'], index: true },
    targetId: { type: String, required: true, trim: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ContactRequest', contactRequestSchema)
