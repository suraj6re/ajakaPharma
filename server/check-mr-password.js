const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkMRPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const mrEmail = 'mr@ajaka.com';
    const testPassword = 'mr123';

    const user = await User.findOne({ email: mrEmail });
    
    if (!user) {
      console.log('❌ User not found:', mrEmail);
      return;
    }

    console.log('👤 User found:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Password Hash:', user.password.substring(0, 20) + '...');
    console.log('');

    // Test password
    console.log('🔐 Testing password:', testPassword);
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password is CORRECT');
    } else {
      console.log('❌ Password is WRONG');
      console.log('');
      console.log('🔧 Resetting password to: mr123');
      
      const newPassword = await bcrypt.hash('mr123', 10);
      user.password = newPassword;
      await user.save();
      
      console.log('✅ Password reset successfully');
      console.log('');
      console.log('🔐 New Login Credentials:');
      console.log('   Email: mr@ajaka.com');
      console.log('   Password: mr123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

checkMRPassword();
