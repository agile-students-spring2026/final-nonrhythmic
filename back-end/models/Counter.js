const mongoose = require('mongoose')

// Single-document sequence store; _id is the counter name (e.g. "tenant" for tenant display ids).
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: 'counters' },
)

module.exports = mongoose.model('Counter', counterSchema)
