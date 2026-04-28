const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    neighborhoods: { type: String, required: true, trim: true },
    subleaseWindow: { type: String, required: true, trim: true },
    budget: { type: String, default: '$0/mo' },
    intro: { type: String, default: '' },
    ideal: { type: String, default: '' },
    questions: { type: String, default: '' },
    company: { type: String, default: 'Summer internship' },
    avatarSeed: { type: String, default: '' },
    posterUserId: { type: String, default: null, index: true },
    proofUrls: { type: [String], default: [] },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Tenant', tenantSchema)
