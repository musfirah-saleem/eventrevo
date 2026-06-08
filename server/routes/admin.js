// const router = require('express').Router();
// const { protect, requireRole } = require('../middleware/auth');
// const DJProfile = require('../models/DJProfile');
// const Booking = require('../models/Booking');
// const User = require('../models/User');
// router.use(protect, requireRole('admin'));
// router.get('/djs', async (req, res) => {
//   const djs = await DJProfile.find().populate('user','name email createdAt').sort({ createdAt: -1 });
//   res.json({ success: true, data: djs });
// });
// router.patch('/djs/:id', async (req, res) => {
//   const dj = await DJProfile.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
//   res.json({ success: true, data: dj });
// });
// router.get('/bookings', async (req, res) => {
//   const bookings = await Booking.find()
//     .populate('customer','name email')
//     .populate({ path:'djProfile', populate:{ path:'user', select:'name' }})
//     .sort({ createdAt: -1 }).limit(100);
//   res.json({ success: true, data: bookings });
// });
// router.get('/stats', async (req, res) => {
//   const [djCount, userCount, bookingCount, revenue] = await Promise.all([
//     DJProfile.countDocuments({ status:'approved' }),
//     User.countDocuments({ role:'customer' }),
//     Booking.countDocuments(),
//     Booking.aggregate([{ $match:{ status:'completed' }},{ $group:{ _id:null, total:{ $sum:'$totalAmount' }}}]),
//   ]);
//   res.json({ success:true, data:{ approvedDJs:djCount, customers:userCount, totalBookings:bookingCount, totalRevenue: revenue[0]?.total||0 }});
// });
// module.exports = router;


const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const DJProfile = require('../models/DJProfile');
const Booking = require('../models/Booking');
const User = require('../models/User');

router.use(protect, requireRole('admin'));

const toArray = value => {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(v => v.trim()).filter(Boolean);
  return undefined;
};

const profileFieldsFromBody = body => {
  const updates = {};

  [
    'stageName',
    'bio',
    'location',
    'hourlyRate',
    'minimumHours',
    'packageDetails',
    'profileImage',
    'advanceBookingPercentage',
    'minimumAdvanceAmount',
    'status',
    'featured',
  ].forEach(field => {
    if (body[field] !== undefined) updates[field] = body[field];
  });

  const genres = toArray(body.genres);
  const eventTypes = toArray(body.eventTypes);

  if (genres !== undefined) updates.genres = genres;
  if (eventTypes !== undefined) updates.eventTypes = eventTypes;

  return updates;
};

router.get('/djs', async (req, res) => {
  try {
    const djs = await DJProfile.find()
      .populate('user', 'name email phone location createdAt isActive')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: djs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch DJs' });
  }
});

router.post('/djs', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const profileData = profileFieldsFromBody(req.body);

    if (!name || !email || !password || !profileData.stageName) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, password and stage name are required',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      location: profileData.location || 'Canberra, ACT',
      role: 'dj',
      emailVerified: true,
    });

    const dj = await DJProfile.create({
      user: user._id,
      status: profileData.status || 'approved',
      weeklyAvailability: [
        { dayOfWeek: 5, startTime: '18:00', endTime: '02:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '14:00', endTime: '02:00', isAvailable: true },
        { dayOfWeek: 0, startTime: '14:00', endTime: '23:00', isAvailable: true },
      ],
      ...profileData,
    });

    const populated = await DJProfile.findById(dj._id)
      .populate('user', 'name email phone location createdAt isActive');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Admin create DJ error:', err);
    res.status(500).json({ success: false, error: 'Failed to create DJ' });
  }
});

router.patch('/djs/:id', async (req, res) => {
  try {
    const dj = await DJProfile.findById(req.params.id);
    if (!dj) return res.status(404).json({ success: false, error: 'DJ profile not found' });

    const profileUpdates = profileFieldsFromBody(req.body);
    const userUpdates = {};

    if (req.body.name !== undefined) userUpdates.name = req.body.name;
    if (req.body.email !== undefined) userUpdates.email = req.body.email;
    if (req.body.phone !== undefined) userUpdates.phone = req.body.phone;
    if (req.body.userLocation !== undefined) userUpdates.location = req.body.userLocation;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(dj.user, userUpdates, { runValidators: true });
    }

    if (req.body.password) {
      const user = await User.findById(dj.user).select('+password');
      user.password = req.body.password;
      await user.save();
    }

    const updated = await DJProfile.findByIdAndUpdate(
      req.params.id,
      { $set: profileUpdates },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone location createdAt isActive');

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Admin update DJ error:', err);
    res.status(500).json({ success: false, error: 'Failed to update DJ' });
  }
});

router.delete('/djs/:id', async (req, res) => {
  try {
    const dj = await DJProfile.findById(req.params.id);
    if (!dj) return res.status(404).json({ success: false, error: 'DJ profile not found' });

    const bookingCount = await Booking.countDocuments({ djProfile: dj._id });

    if (bookingCount > 0) {
      const suspended = await DJProfile.findByIdAndUpdate(
        dj._id,
        { status: 'suspended' },
        { new: true }
      ).populate('user', 'name email phone location createdAt isActive');

      await User.findByIdAndUpdate(dj.user, { isActive: false });

      return res.json({
        success: true,
        data: suspended,
        message: 'DJ has existing bookings, so the account was suspended instead of permanently deleted',
      });
    }

    await User.findByIdAndDelete(dj.user);
    await DJProfile.findByIdAndDelete(dj._id);

    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    console.error('Admin delete DJ error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete DJ' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email')
      .populate({ path: 'djProfile', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [djCount, userCount, bookingCount, revenue] = await Promise.all([
      DJProfile.countDocuments({ status: 'approved' }),
      User.countDocuments({ role: 'customer' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        approvedDJs: djCount,
        customers: userCount,
        totalBookings: bookingCount,
        totalRevenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

module.exports = router;