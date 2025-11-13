require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const adminEmail = 'suraj6re@gmail.com';
    const adminPassword = 'Admin@123'; // Change this to your desired password

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('✅ Admin user already exists');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
    } else {
      // Create new admin user
      admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin',
        phone: '+91-9876543210',
        territory: 'All India',
        isActive: true
      });
      console.log('✅ Created new admin user');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
    }

    console.log('\n🔐 Login Credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n✅ You can now login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
