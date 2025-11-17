const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MRRequest, User } = require('./models');

async function fixAllApprovedPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all approved requests that have temp passwords
    const approvedRequests = await MRRequest.find({
      status: 'approved',
      tempPassword: { $exists: true, $ne: null }
    }).populate('createdUserId');

    console.log(`📋 Found ${approvedRequests.length} approved requests with temp passwords\n`);

    if (approvedRequests.length === 0) {
      console.log('ℹ️  No approved requests to fix');
      await mongoose.connection.close();
      return;
    }

    let fixed = 0;
    let skipped = 0;

    for (const request of approvedRequests) {
      if (!request.createdUserId) {
        console.log(`⚠️  Skipping ${request.email} - no user created`);
        skipped++;
        continue;
      }

      const user = request.createdUserId;
      const tempPassword = request.tempPassword;

      console.log(`🔧 Fixing: ${user.name} (${user.email})`);
      console.log(`   Temp Password: ${tempPassword}`);

      // Reset password (set plain text, let pre-save hook hash it)
      user.password = tempPassword;
      await user.save();

      console.log(`   ✅ Fixed\n`);
      fixed++;
    }

    console.log('📊 Summary:');
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${approvedRequests.length}`);
    console.log('');
    console.log('🎉 All approved users can now login with their temp passwords!');

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllApprovedPasswords();
