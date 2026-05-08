// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  djProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DJProfile', required: true },

  // Guest booking (no account)
  guestName: { type: String },
  guestEmail: { type: String },

  // Event details
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true }, // hours
  location: { type: String, required: true },
  guestCount: { type: Number },
  notes: { type: String, default: '' },

  // Status
  status: {
    type: String,
    enum: ['pending','confirmed','declined','completed','cancelled'],
    default: 'pending',
  },

  // Pricing
  quotedRate: { type: Number },
  totalAmount: { type: Number },
  depositAmount: { type: Number },
  depositPercentage: { type: Number, default: 20 },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['unpaid','deposit_paid','fully_paid','refunded'],
    default: 'unpaid',
  },
  stripePaymentIntentId: { type: String },
  stripeDepositId: { type: String },

  // Google Calendar
  googleEventId: { type: String },

  // Timestamps
  confirmedAt: { type: Date },
  declinedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ djProfile: 1, status: 1 });
bookingSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
