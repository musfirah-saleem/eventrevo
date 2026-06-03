// server/models/DJProfile.js
const mongoose = require('mongoose');

const mediaLinkSchema = new mongoose.Schema({
  platform: { type: String, enum: ['youtube','soundcloud','mixcloud','instagram','spotify','facebook'], required: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
}, { _id: true });

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun 6=Sat
  startTime: { type: String, default: '18:00' },
  endTime: { type: String, default: '02:00' },
  isAvailable: { type: Boolean, default: false },
});

const djProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stageName: { type: String, required: true, trim: true },
  bio: { type: String, default: '', maxlength: 2000 },
  location: { type: String, default: 'Canberra, ACT' },
  status: { type: String, enum: ['pending_review','approved','rejected','suspended'], default: 'pending_review' },

  // Pricing
  hourlyRate: { type: Number, default: 0, min: 0 },
  minimumHours: { type: Number, default: 2, min: 1 },
  packageDetails: { type: String, default: '', maxlength: 1000 },

  // Genres & events
  genres: [{ type: String }],
  eventTypes: [{ type: String }],

  // Media
  profileImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  mediaLinks: [mediaLinkSchema],

  // Socials
  socials: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    soundcloud: { type: String, default: '' },
    spotify: { type: String, default: '' },
    youtube: { type: String, default: '' },
    mixcloud: { type: String, default: '' },
    tiktok: { type: String, default: '' },
  },

  // Calendar
  googleCalendarId: { type: String },
  googleAccessToken: { type: String, select: false },
  googleRefreshToken: { type: String, select: false },

  // Availability
  weeklyAvailability: [availabilitySchema],
  blockedDates: [{ date: Date, reason: String }],

  // Stats (denormalised for speed)
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  advanceBookingPercentage: {type: Number, default: 0, min: 0, max: 100 },
  // Absolute minimum deposit (AUD) the DJ requires to secure a booking.
  // If 0, we fall back to percentage-only deposit logic.
  minimumAdvanceAmount: { type: Number, default: 0, min: 0 },
  totalReviews: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },

  // Stripe Connect (for payouts)
  stripeAccountId: { type: String, default: '' },

  featured: { type: Boolean, default: false },
}, { timestamps: true });

// Text search index
djProfileSchema.index({ stageName: 'text', bio: 'text', genres: 'text' });
djProfileSchema.index({ status: 1, averageRating: -1 });
djProfileSchema.index({ genres: 1 });
djProfileSchema.index({ eventTypes: 1 });

module.exports = mongoose.model('DJProfile', djProfileSchema);
