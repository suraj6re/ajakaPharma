require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetMRPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const mrEmail = 'mr@ajaka.com';
    const newPassword = 'MR@123';

    const user = await User.findOne({ email: mrEmail });
    
    if (!user) {
      console.log('❌ MR user not found');
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log('✅ MR password reset successfully!\n');
    console.log('🔐 Login Credentials:');
    console.log('   Email:', mrEmail);
    console.log('   Password:', newPassword);
    console.log('   Role:', user.role);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetMRPassword();
