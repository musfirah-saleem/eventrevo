const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const DJProfile = require('../models/DJProfile');
const Booking = require('../models/Booking');
const User = require('../models/User');
router.use(protect, requireRole('admin'));
router.get('/djs', async (req, res) => {
  const djs = await DJProfile.find().populate('user','name email createdAt').sort({ createdAt: -1 });
  res.json({ success: true, data: djs });
});
router.patch('/djs/:id', async (req, res) => {
  const dj = await DJProfile.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, data: dj });
});
router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find()
    .populate('customer','name email')
    .populate({ path:'djProfile', populate:{ path:'user', select:'name' }})
    .sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: bookings });
});
router.get('/stats', async (req, res) => {
  const [djCount, userCount, bookingCount, revenue] = await Promise.all([
    DJProfile.countDocuments({ status:'approved' }),
    User.countDocuments({ role:'customer' }),
    Booking.countDocuments(),
    Booking.aggregate([{ $match:{ status:'completed' }},{ $group:{ _id:null, total:{ $sum:'$totalAmount' }}}]),
  ]);
  res.json({ success:true, data:{ approvedDJs:djCount, customers:userCount, totalBookings:bookingCount, totalRevenue: revenue[0]?.total||0 }});
});
module.exports = router;
