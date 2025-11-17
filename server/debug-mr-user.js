const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugMRUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const mrEmail = 'mr@ajaka.com';
    const user = await User.findOne({ email: mrEmail });
    
    if (!user) {
      console.log('❌ User not found:', mrEmail);
      console.log('\n🔧 Creating MR user...');
      
      const hashedPassword = await bcrypt.hash('mr123', 10);
      const newUser = await User.create({
        name: 'MR User',
        email: 'mr@ajaka.com',
        password: hashedPassword,
        role: 'MR',
        employeeId: 'MR001',
        phone: '+91 9876543210',
        territory: 'Mumbai',
        region: 'West',
        city: 'Mumbai',
        isActive: true
      });
      
      console.log('✅ MR user created');
      console.log('   Email: mr@ajaka.com');
      console.log('   Password: mr123');
      return;
    }

    console.log('👤 User Details:');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Employee ID:', user.employeeId);
    console.log('   Password Hash:', user.password);
    console.log('');

    // Test multiple passwords
    const passwords = ['mr123', 'MR123', 'Mr123', 'mr@123'];
    
    console.log('🔐 Testing passwords:');
    for (const pwd of passwords) {
      const isMatch = await bcrypt.compare(pwd, user.password);
      console.log(`   ${pwd}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    console.log('');

    // Reset password (set plain text, let pre-save hook hash it)
    console.log('🔧 Resetting password to: mr123');
    user.password = 'mr123';  // Set plain text password
    await user.save();  // Pre-save hook will hash it
    console.log('✅ Password reset complete');
    console.log('');

    // Verify new password
    const verifyUser = await User.findOne({ email: mrEmail });
    const isNewPasswordCorrect = await bcrypt.compare('mr123', verifyUser.password);
    console.log('🔍 Verification:');
    console.log('   Password "mr123":', isNewPasswordCorrect ? '✅ WORKS' : '❌ FAILED');
    console.log('');
    
    console.log('🔐 Login Credentials:');
    console.log('   Email: mr@ajaka.com');
    console.log('   Password: mr123');
    console.log('   Role: MR');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

debugMRUser();
