const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    recipientUserId: { type: String, required: true, index: true },
    kind: {
      type: String,
      required: true,
      enum: ['listing_contact', 'tenant_contact', 'listing_application'],
      index: true,
    },
    listingId: { type: Number, default: null },
    listingName: { type: String, default: '', trim: true },
    tenantId: { type: String, default: null },
    tenantName: { type: String, default: '', trim: true },
    fromUserId: { type: String, required: true },
    fromUserName: { type: String, required: true, trim: true },
    fromEmail: { type: String, required: true, trim: true, lowercase: true },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Notification', notificationSchema)
