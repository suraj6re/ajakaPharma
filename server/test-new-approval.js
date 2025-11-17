const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MRRequest, User } = require('./models');
const bcrypt = require('bcryptjs');

async function testNewApproval() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const testEmail = 'test.new.mr@example.com';
    
    // Clean up if exists
    await User.deleteOne({ email: testEmail });
    await MRRequest.deleteOne({ email: testEmail });
    
    console.log('📝 Step 1: Creating test MR request...');
    const request = await MRRequest.create({
      name: 'Test New MR',
      email: testEmail,
      phone: '+91 9999999999',
      area: 'Test Area',
      experience: 'Testing new approval flow',
      status: 'pending'
    });
    console.log('✅ Request created\n');

    console.log('📝 Step 2: Simulating approval (with fixed code)...');
    
    // Generate temporary password (same as controller)
    const tempPassword = Math.random().toString(36).slice(-10).toUpperCase();
    console.log('🔑 Generated temp password:', tempPassword);
    
    // Generate employee ID
    const userCount = await User.countDocuments({ role: 'MR' });
    const employeeId = `MR${String(userCount + 1).padStart(3, '0')}`;
    console.log('👤 Generated employee ID:', employeeId);
    console.log('');

    // Create user (FIXED: passing plain text password)
    console.log('📝 Step 3: Creating user with PLAIN TEXT password...');
    const newUser = await User.create({
      name: request.name,
      email: request.email,
      password: tempPassword,  // ✅ PLAIN TEXT - model will hash it
      role: 'MR',
      employeeId,
      phone: request.phone,
      territory: request.area,
      region: request.area,
      city: request.area,
      isActive: true
    });
    console.log('✅ User created\n');

    // Update request
    request.status = 'approved';
    request.tempPassword = tempPassword;
    request.createdUserId = newUser._id;
    await request.save();

    console.log('📝 Step 4: Verifying password works...');
    
    // Fetch user from DB
    const verifyUser = await User.findOne({ email: testEmail });
    
    // Test password
    const isMatch = await bcrypt.compare(tempPassword, verifyUser.password);
    
    if (isMatch) {
      console.log('✅ Password verification: SUCCESS!');
      console.log('');
      console.log('🎉 NEW APPROVAL FLOW IS WORKING!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log('   Email:', testEmail);
      console.log('   Password:', tempPassword);
      console.log('   Employee ID:', employeeId);
    } else {
      console.log('❌ Password verification: FAILED!');
      console.log('');
      console.log('⚠️  The fix is NOT working - still double-hashing');
    }

    // Clean up
    console.log('');
    console.log('🧹 Cleaning up test data...');
    await User.deleteOne({ email: testEmail });
    await MRRequest.deleteOne({ email: testEmail });
    console.log('✅ Cleaned up');

    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testNewApproval();
