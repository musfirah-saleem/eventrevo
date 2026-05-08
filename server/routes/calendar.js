const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const { google } = require('googleapis');
const DJProfile = require('../models/DJProfile');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALENDAR_REDIRECT_URI
);

router.get('/auth-url', protect, requireRole('dj'), (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    state: req.user.id,
  });
  res.json({ success: true, url });
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    await DJProfile.findOneAndUpdate({ user: userId }, {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token,
    });
    res.redirect(`${process.env.CLIENT_URL}/dashboard/dj?calendar=connected`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/dashboard/dj?calendar=error`);
  }
});

module.exports = router;
