const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MRRequest, User } = require('./models');
const bcrypt = require('bcryptjs');

async function fixLatestApproval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the most recent approved request
    const latestApproval = await MRRequest.findOne({
      status: 'approved',
      tempPassword: { $exists: true, $ne: null }
    })
    .sort({ processedAt: -1 })
    .populate('createdUserId');

    if (!latestApproval) {
      console.log('ℹ️  No approved requests found');
      await mongoose.connection.close();
      return;
    }

    console.log('📋 Latest Approved Request:');
    console.log('   Name:', latestApproval.name);
    console.log('   Email:', latestApproval.email);
    console.log('   Approved:', latestApproval.processedAt?.toLocaleString());
    console.log('   Temp Password:', latestApproval.tempPassword);
    console.log('');

    if (!latestApproval.createdUserId) {
      console.log('❌ No user created for this request');
      await mongoose.connection.close();
      return;
    }

    const user = latestApproval.createdUserId;
    const tempPassword = latestApproval.tempPassword;

    console.log('🔍 Testing if password works...');
    const isMatch = await bcrypt.compare(tempPassword, user.password);

    if (isMatch) {
      console.log('✅ Password already works!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log('   Email:', user.email);
      console.log('   Password:', tempPassword);
      console.log('   Employee ID:', user.employeeId);
    } else {
      console.log('❌ Password does NOT work (double-hashed)');
      console.log('');
      console.log('🔧 Fixing password...');
      
      // Reset password (plain text, let pre-save hook hash it)
      user.password = tempPassword;
      await user.save();
      
      console.log('✅ Password fixed!');
      console.log('');
      console.log('🔍 Verifying...');
      
      const verifyUser = await User.findById(user._id);
      const nowWorks = await bcrypt.compare(tempPassword, verifyUser.password);
      
      if (nowWorks) {
        console.log('✅ Password now works!');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('   Email:', user.email);
        console.log('   Password:', tempPassword);
        console.log('   Employee ID:', user.employeeId);
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

fixLatestApproval();
