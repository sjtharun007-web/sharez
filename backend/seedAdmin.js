const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('⚠️  Admin already exists:', existing.email);
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@campus.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
