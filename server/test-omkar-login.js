const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testOmkarLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const email = 'omkarrangole444@gmail.com';
    const tempPassword = 'Z6VDAAWQOO';

    console.log('🔍 Checking user:', email);
    console.log('🔑 Testing password:', tempPassword);
    console.log('');

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      await mongoose.connection.close();
      return;
    }

    console.log('👤 User found:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Employee ID:', user.employeeId);
    console.log('   Password hash:', user.password.substring(0, 30) + '...');
    console.log('');

    // Test the temporary password
    console.log('🔐 Testing temporary password...');
    const isMatch = await bcrypt.compare(tempPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Password WORKS!');
      console.log('');
      console.log('🎉 User can login with:');
      console.log('   Email:', email);
      console.log('   Password:', tempPassword);
    } else {
      console.log('❌ Password DOES NOT WORK');
      console.log('');
      console.log('🔧 This means the password was double-hashed during approval');
      console.log('');
      console.log('💡 Fixing by resetting password...');
      
      // Reset password (set plain text, let pre-save hook hash it)
      user.password = tempPassword;
      await user.save();
      
      console.log('✅ Password reset complete');
      console.log('');
      console.log('🔍 Verifying...');
      
      const verifyUser = await User.findOne({ email });
      const isNowCorrect = await bcrypt.compare(tempPassword, verifyUser.password);
      
      if (isNowCorrect) {
        console.log('✅ Password now WORKS!');
        console.log('');
        console.log('🎉 User can now login with:');
        console.log('   Email:', email);
        console.log('   Password:', tempPassword);
      } else {
        console.log('❌ Still not working - something else is wrong');
      }
    }

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testOmkarLogin();
