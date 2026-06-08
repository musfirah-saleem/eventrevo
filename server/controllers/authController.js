// // server/controllers/authController.js
// const User = require('../models/User');
// const DJProfile = require('../models/DJProfile');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const { sendEmail } = require('../utils/email');

// const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// const sendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);
//   res.status(statusCode).json({ success: true, token, user });
// };

// // POST /api/auth/register
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, stageName } = req.body;

//     if (!['customer', 'dj'].includes(role)) {
//       return res.status(400).json({ success: false, error: 'Invalid role' });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });

//     const user = await User.create({ name, email, password, role });

//     // Create DJ profile if registering as DJ
//     if (role === 'dj') {
//       await DJProfile.create({
//         user: user._id,
//         stageName: stageName || name,
//         genres: [],
//         eventTypes: [],
//         weeklyAvailability: [
//           { dayOfWeek: 5, startTime: '18:00', endTime: '02:00', isAvailable: true },
//           { dayOfWeek: 6, startTime: '14:00', endTime: '02:00', isAvailable: true },
//           { dayOfWeek: 0, startTime: '14:00', endTime: '23:00', isAvailable: true },
//         ],
//       });
//     }

//     sendToken(user, 201, res);
//   } catch (err) {
//     console.error('Register error:', err);
//     res.status(500).json({ success: false, error: 'Registration failed' });
//   }
// };

// // POST /api/auth/login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

//     const user = await User.findOne({ email }).select('+password');
//     if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
//     if (!user.password) return res.status(401).json({ success: false, error: 'Please sign in with Google' });

//     const match = await user.matchPassword(password);
//     if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });

//     sendToken(user, 200, res);
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Login failed' });
//   }
// };

// // GET /api/auth/me
// exports.getMe = async (req, res) => {
//   const user = await User.findById(req.user.id);
//   res.json({ success: true, user });
// };

// // POST /api/auth/forgot-password
// exports.forgotPassword = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) return res.status(404).json({ success: false, error: 'No account with that email' });

//     const token = crypto.randomBytes(32).toString('hex');
//     user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
//     user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
//     await user.save({ validateBeforeSave: false });

//     const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
//     await sendEmail({
//       to: user.email,
//       subject: 'EventRevo — Reset your password',
//       html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
//     });

//     res.json({ success: true, message: 'Password reset email sent' });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Email could not be sent' });
//   }
// };

// // PUT /api/auth/reset-password/:token
// exports.resetPassword = async (req, res) => {
//   try {
//     const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
//     const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
//     if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();

//     sendToken(user, 200, res);
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Reset failed' });
//   }
// };



// server/controllers/authController.js
const User = require('../models/User');
const DJProfile = require('../models/DJProfile');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = 'customer';

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, error: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    sendToken(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (!user.password) return res.status(401).json({ success: false, error: 'Please sign in with Google' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, error: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'EventRevo — Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 10 minutes.</p>`,
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Email could not be sent' });
  }
};

// PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Reset failed' });
  }
};