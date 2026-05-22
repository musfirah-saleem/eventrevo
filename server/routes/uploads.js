const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const DJProfile = require('../models/DJProfile');
const User = require('../models/User');
const path = require('path');

let storage;
let bucket;
let gcsInitError = null;
try {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || !process.env.GCS_BUCKET_NAME) {
    throw new Error('Missing GCS configuration: set GOOGLE_APPLICATION_CREDENTIALS and GCS_BUCKET_NAME in environment');
  }

  storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
  bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
} catch (err) {
  // store the initialization error so routes can return a helpful message
  gcsInitError = err;
  console.error('GCS initialization error:', err && err.message ? err.message : err);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images only'));
  },
});

const uploadToGCS = (file, folder) => new Promise((resolve, reject) => {
  if (gcsInitError) return reject(new Error(`GCS not configured: ${gcsInitError.message}`));
  if (!bucket) return reject(new Error('GCS bucket is not available'));

  const ext = path.extname(file.originalname);
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const blob = bucket.file(filename);
  const stream = blob.createWriteStream({ metadata: { contentType: file.mimetype }, resumable: false });
  stream.on('error', (err) => {
    console.error('Error uploading to GCS:', err && err.message ? err.message : err);
    reject(err);
  });
  stream.on('finish', () => resolve(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`));
  stream.end(file.buffer);
});

// Upload profile image
router.post('/profile', protect, upload.single('image'), async (req, res) => {
  try {
    if (gcsInitError) return res.status(500).json({ success: false, error: `Server misconfiguration: ${gcsInitError.message}` });
    if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
    const url = await uploadToGCS(req.file, `profiles/${req.user.id}`);
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    if (req.user.role === 'dj') {
      await DJProfile.findOneAndUpdate({ user: req.user.id }, { profileImage: url });
    }
    res.json({ success: true, url });
  } catch (err) {
    console.error('Profile upload error:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload gallery image (DJ only)
router.post('/gallery', protect, requireRole('dj'), upload.single('image'), async (req, res) => {
  try {
    if (gcsInitError) return res.status(500).json({ success: false, error: `Server misconfiguration: ${gcsInitError.message}` });
    if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
    const url = await uploadToGCS(req.file, `gallery/${req.user.id}`);
    const dj = await DJProfile.findOneAndUpdate(
      { user: req.user.id },
      { $push: { galleryImages: url } },
      { new: true }
    );
    res.json({ success: true, url, galleryImages: dj.galleryImages });
  } catch (err) {
    console.error('Gallery upload error:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete gallery image
router.delete('/gallery', protect, requireRole('dj'), async (req, res) => {
  try {
    const { url } = req.body;
    await DJProfile.findOneAndUpdate({ user: req.user.id }, { $pull: { galleryImages: url } });
    // Optionally delete from GCS bucket here
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

module.exports = router;
