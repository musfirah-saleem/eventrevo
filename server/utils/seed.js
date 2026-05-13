// server/utils/seed.js
// Run with: node server/utils/seed.js
require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('../models/User');
  const DJProfile = require('../models/DJProfile');

  // Admin user
  const adminPw = await bcrypt.hash('admin123!', 12);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@gmail.com' },
    { name: 'EventRevo Admin', email: 'admin@gmail.com', password: adminPw, role: 'admin', emailVerified: true },
    { upsert: true, new: true }
  );
  console.log('✅ Admin created:', admin.email);

  // Sample DJs
  const djPw = await bcrypt.hash('DJpass123!', 12);
  const djData = [
    { name: 'Alex Kastro', email: 'kastro@eventrevo.com.au', stageName: 'DJ Kastro', bio: 'Canberra-based DJ with 8 years of experience across weddings, corporate events, and clubs. Known for reading the room and keeping the floor packed all night.', genres: ['House','Afrobeats','R&B','Hip-Hop'], eventTypes: ['Wedding','Corporate','Birthday'], hourlyRate: 200, minimumHours: 3 },
    { name: 'Jordan Lee', email: 'neonx@eventrevo.com.au', stageName: 'Neon X', bio: 'Electronic music specialist. From intimate private events to large festivals — if it needs a soundtrack, I deliver.', genres: ['Techno','Electro','Dark House','Minimal'], eventTypes: ['Club Night','Festival','Corporate'], hourlyRate: 180, minimumHours: 2 },
    { name: 'Sofia Garcia', email: 'lavida@eventrevo.com.au', stageName: 'DJ LaVida', bio: 'Bringing Latin heat to Canberra events. Weddings are my specialty — I know how to guide guests from ceremony to dancefloor chaos.', genres: ['Latin','Salsa','Pop','R&B'], eventTypes: ['Wedding','Birthday','Corporate'], hourlyRate: 220, minimumHours: 4 },
    { name: 'Marcus Webb', email: 'bassline@eventrevo.com.au', stageName: 'Bassline Marcus', bio: "12 years behind the decks, from Canberra's early rave scene to today's premium corporate events.", genres: ['Drum & Bass','Jungle','House','Funk'], eventTypes: ['Corporate','Birthday','NYE Party'], hourlyRate: 250, minimumHours: 3 },
    { name: 'Casey Park', email: 'prism@eventrevo.com.au', stageName: 'DJ Prism', bio: 'Top 40 and commercial specialist. Perfect for corporate events, EOFY parties, and weddings where everyone needs to dance.', genres: ['Top 40','Pop','Commercial Dance','Classic Hits'], eventTypes: ['Wedding','Corporate','EOFY Party','Birthday'], hourlyRate: 160, minimumHours: 3 },
  ];

  for (const dj of djData) {
    const user = await User.findOneAndUpdate(
      { email: dj.email },
      { name: dj.name, email: dj.email, password: djPw, role: 'dj', emailVerified: true },
      { upsert: true, new: true }
    );
    await DJProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id, stageName: dj.stageName, bio: dj.bio, location: 'Canberra, ACT',
        status: 'approved', genres: dj.genres, eventTypes: dj.eventTypes,
        hourlyRate: dj.hourlyRate, minimumHours: dj.minimumHours,
        averageRating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 25) + 5,
        totalBookings: Math.floor(Math.random() * 80) + 20,
        weeklyAvailability: [
          { dayOfWeek: 5, startTime: '18:00', endTime: '02:00', isAvailable: true },
          { dayOfWeek: 6, startTime: '14:00', endTime: '02:00', isAvailable: true },
          { dayOfWeek: 0, startTime: '14:00', endTime: '23:00', isAvailable: true },
        ],
      },
      { upsert: true, new: true }
    );
    console.log('✅ DJ created:', dj.stageName);
  }

  console.log('\n🎉 Seed complete!');
  console.log('Admin: admin@gmail.com / admin123!');
  console.log('DJ:    kastro@eventrevo.com.au / DJpass123!');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
