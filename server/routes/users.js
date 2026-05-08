const router = require('express').Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, location }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, error: 'Update failed' }); }
});
router.put('/me/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!await user.matchPassword(req.body.currentPassword)) return res.status(401).json({ success: false, error: 'Current password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { res.status(500).json({ success: false, error: 'Update failed' }); }
});
module.exports = router;
