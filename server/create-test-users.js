const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('./models/User');

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@ajaka.com',
      password: 'admin123',
      role: 'Admin',
      isActive: true
    });

    // Create MR user
    const mrUser = new User({
      name: 'MR User',
      email: 'mr@ajaka.com',
      password: 'mr123',
      role: 'MR',
      territory: 'Mumbai',
      city: 'Mumbai',
      isActive: true
    });

    await adminUser.save();
    await mrUser.save();

    console.log('✅ Test users created successfully:');
    console.log('Admin: admin@ajaka.com / admin123');
    console.log('MR: mr@ajaka.com / mr123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();