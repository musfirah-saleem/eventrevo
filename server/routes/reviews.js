const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
router.get('/dj/:djId', async (req, res) => {
  const reviews = await Review.find({ djProfile: req.params.djId, isPublic: true })
    .populate('customer', 'name avatar').sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: reviews });
});
router.post('/', protect, requireRole('customer'), async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'completed') return res.status(400).json({ success: false, error: 'Can only review completed bookings' });
    if (!booking.customer.equals(req.user.id)) return res.status(403).json({ success: false, error: 'Forbidden' });
    const review = await Review.create({ booking: bookingId, customer: req.user.id, djProfile: booking.djProfile, rating, comment });
    res.status(201).json({ success: true, data: review });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
module.exports = router;
