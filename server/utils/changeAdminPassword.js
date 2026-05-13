// server/utils/changeAdminPassword.js
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@gmail.com';
    const newPlain = 'admin123';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error('User not found:', email);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Option A: set plain and save so pre-save hashes it
    user.password = newPlain;
    await user.save();

    console.log(`Password updated for ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
}

run();
