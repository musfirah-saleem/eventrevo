// server/utils/checkAdmin.js
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const emails = ['admin@gmail.com', 'admin@eventrevo.com.au', 'admin@eventrevo.com'];
    for (const email of emails) {
      const u = await User.findOne({ email }).select('+password');
      if (!u) {
        console.log(`No user found for ${email}`);
        continue;
      }
      console.log(`Found user: ${u.email} (role=${u.role}, isActive=${u.isActive}, emailVerified=${u.emailVerified})`);
      console.log('Password hash present?', !!u.password);
      if (u.password) {
        const match = await bcrypt.compare('ChangeMe_Admin123!', u.password);
        console.log('Matches default seed password ChangeMe_Admin123!?', match);
      }
    }

    await mongoose.disconnect();
  } catch (e) {
    console.error('Error', e);
    process.exit(1);
  }
}

run();
