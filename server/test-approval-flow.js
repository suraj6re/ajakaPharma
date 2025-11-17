const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MRRequest, User } = require('./models');
const emailService = require('./services/emailService');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mr-reporting-system';

async function testApprovalFlow() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create a test MR request
    console.log('📝 Step 1: Creating test MR request...');
    const testRequest = await MRRequest.create({
      name: 'Test Applicant',
      email: 'test.applicant@example.com',
      phone: '+91 98765 43210',
      area: 'Mumbai',
      experience: 'Test experience for approval flow',
      status: 'pending'
    });
    console.log('✅ Test request created:', testRequest._id);
    console.log('   Email:', testRequest.email);
    console.log('   Status:', testRequest.status);
    console.log('');

    // Step 2: Simulate approval process
    console.log('📝 Step 2: Simulating approval process...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testRequest.email });
    if (existingUser) {
      console.log('⚠️  User already exists, deleting...');
      await User.deleteOne({ email: testRequest.email });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10).toUpperCase();
    console.log('🔑 Generated temp password:', tempPassword);
    
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Generate employee ID
    const userCount = await User.countDocuments({ role: 'MR' });
    const employeeId = `MR${String(userCount + 1).padStart(3, '0')}`;
    console.log('👤 Generated employee ID:', employeeId);
    console.log('');

    // Step 3: Create user account
    console.log('📝 Step 3: Creating user account...');
    const newUser = await User.create({
      name: testRequest.name,
      email: testRequest.email,
      password: hashedPassword,
      role: 'MR',
      employeeId,
      phone: testRequest.phone,
      territory: testRequest.area,
      region: testRequest.area,
      city: testRequest.area,
      isActive: true
    });
    console.log('✅ User created:', newUser._id);
    console.log('   Email:', newUser.email);
    console.log('   Employee ID:', newUser.employeeId);
    console.log('');

    // Step 4: Update request status
    console.log('📝 Step 4: Updating request status...');
    testRequest.status = 'approved';
    testRequest.processedAt = new Date();
    testRequest.tempPassword = tempPassword;
    testRequest.createdUserId = newUser._id;
    await testRequest.save();
    console.log('✅ Request updated to approved');
    console.log('');

    // Step 5: Send approval email
    console.log('📝 Step 5: Sending approval email...');
    console.log('📧 Attempting to send to:', testRequest.email);
    console.log('🔑 With password:', tempPassword);
    console.log('');
    
    const emailResult = await emailService.sendApprovalEmail(testRequest.email, tempPassword);
    
    if (emailResult.success) {
      console.log('✅ Approval email sent successfully!');
      console.log('📧 Message ID:', emailResult.messageId);
    } else {
      console.log('❌ Failed to send approval email');
      console.log('Error:', emailResult.error);
    }
    console.log('');

    // Step 6: Cleanup
    console.log('📝 Step 6: Cleaning up test data...');
    await MRRequest.deleteOne({ _id: testRequest._id });
    await User.deleteOne({ _id: newUser._id });
    console.log('✅ Test data cleaned up');
    console.log('');

    console.log('🎉 Approval flow test complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   ✅ Request created');
    console.log('   ✅ User account created');
    console.log('   ✅ Request updated to approved');
    console.log('   ' + (emailResult.success ? '✅' : '❌') + ' Email sent');
    console.log('');
    console.log('📬 Check your email at:', process.env.EMAIL_USER);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

testApprovalFlow();
