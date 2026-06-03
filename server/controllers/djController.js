// server/controllers/djController.js
const DJProfile = require('../models/DJProfile');
const User = require('../models/User');

// GET /api/djs — public browse with filters
exports.getDJs = async (req, res) => {
  try {
    const { eventType, genre, minPrice, maxPrice, date, search, page = 1, limit = 20 } = req.query;
    const query = { status: 'approved' };

    if (eventType) query.eventTypes = { $in: [eventType] };
    if (genre) query.genres = { $in: [genre] };
    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };
    if (date) {
      query['blockedDates.date'] = { $not: { $eq: new Date(date) } };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [djs, total] = await Promise.all([
      DJProfile.find(query)
        .populate('user', 'name email avatar')
        .select('-googleAccessToken -googleRefreshToken')
        .sort({ featured: -1, averageRating: -1, totalBookings: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DJProfile.countDocuments(query),
    ]);

    res.json({ success: true, data: djs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch DJs' });
  }
};

// GET /api/djs/:id — public profile
exports.getDJ = async (req, res) => {
  try {
    const dj = await DJProfile.findById(req.params.id)
      .populate('user', 'name email avatar')
      .select('-googleAccessToken -googleRefreshToken');

    if (!dj) return res.status(404).json({ success: false, error: 'DJ not found' });
    if (dj.status !== 'approved') return res.status(404).json({ success: false, error: 'DJ not available' });

    res.json({ success: true, data: dj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch DJ' });
  }
};

// GET /api/djs/me — own profile (DJ auth required)
exports.getMyProfile = async (req, res) => {
  try {
    const dj = await DJProfile.findOne({ user: req.user.id });
    if (!dj) return res.status(404).json({ success: false, error: 'DJ profile not found' });
    res.json({ success: true, data: dj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
};

// PUT /api/djs/me — update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const allowed = ['stageName', 'bio', 'location', 'hourlyRate', 'minimumHours', 'packageDetails', 'genres', 'eventTypes', 'socials', 'profileImage', 'advanceBookingPercentage', 'minimumAdvanceAmount'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!dj) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: dj });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
};

// POST /api/djs/me/media — add media link
exports.addMediaLink = async (req, res) => {
  try {
    const { platform, url, title } = req.body;
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $push: { mediaLinks: { platform, url, title } } },
      { new: true }
    );
    res.json({ success: true, data: dj.mediaLinks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add media' });
  }
};

// DELETE /api/djs/me/media/:mediaId
exports.removeMediaLink = async (req, res) => {
  try {
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { mediaLinks: { _id: req.params.mediaId } } },
      { new: true }
    );
    res.json({ success: true, data: dj.mediaLinks });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove media' });
  }
};

// PUT /api/djs/me/availability
exports.updateAvailability = async (req, res) => {
  try {
    const { weeklyAvailability } = req.body;
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { weeklyAvailability } },
      { new: true }
    );
    res.json({ success: true, data: dj.weeklyAvailability });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update availability' });
  }
};

// POST /api/djs/me/block-date
exports.blockDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $push: { blockedDates: { date: new Date(date), reason } } },
      { new: true }
    );
    res.json({ success: true, data: dj.blockedDates });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to block date' });
  }
};

// DELETE /api/djs/me/block-date/:dateId
exports.unblockDate = async (req, res) => {
  try {
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { blockedDates: { _id: req.params.dateId } } },
      { new: true }
    );
    res.json({ success: true, data: dj.blockedDates });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to unblock date' });
  }
};
