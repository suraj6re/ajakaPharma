const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

async function verifyMREmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔍 Searching for MR users...\n');
    
    // Find all MR users
    const mrUsers = await User.find({ role: 'MR' });
    
    console.log(`Found ${mrUsers.length} MR users:\n`);
    
    mrUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   Email length: ${user.email.length}`);
      console.log(`   Email bytes: ${Buffer.from(user.email).toString('hex')}`);
      console.log(`   Role: "${user.role}"`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });
    
    // Check specifically for mr@ajaka.com
    console.log('🔍 Checking for "mr@ajaka.com" specifically...\n');
    
    const mrUser = await User.findOne({ email: 'mr@ajaka.com' });
    
    if (mrUser) {
      console.log('✅ Found mr@ajaka.com');
      console.log('   Name:', mrUser.name);
      console.log('   Role:', mrUser.role);
      console.log('   Active:', mrUser.isActive);
    } else {
      console.log('❌ NOT found: mr@ajaka.com');
      console.log('\n💡 Possible issues:');
      console.log('   - Email has extra spaces');
      console.log('   - Email has different case');
      console.log('   - Email doesn\'t exist');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyMREmail();
