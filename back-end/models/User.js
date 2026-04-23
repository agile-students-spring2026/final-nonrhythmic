const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, default: '' },
    avatarSeed: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
