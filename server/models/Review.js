// server/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  djProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DJProfile', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  isPublic: { type: Boolean, default: true },
  reply: { type: String, default: '' }, // DJ can reply
}, { timestamps: true });

// After save, update DJ's average rating
reviewSchema.post('save', async function() {
  const DJProfile = mongoose.model('DJProfile');
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { djProfile: this.djProfile, isPublic: true } },
    { $group: { _id: '$djProfile', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await DJProfile.findByIdAndUpdate(this.djProfile, {
      averageRating: Math.round(stats[0].avg * 10) / 10,
      totalReviews: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
