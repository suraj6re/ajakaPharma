const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('name email role isActive');
    
    console.log('📋 Users in database:\n');
    users.forEach(u => {
      console.log(`  ${u.isActive ? '✅' : '❌'} ${u.email}`);
      console.log(`     Name: ${u.name}`);
      console.log(`     Role: ${u.role}`);
      console.log('');
    });

    console.log(`Total users: ${users.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
