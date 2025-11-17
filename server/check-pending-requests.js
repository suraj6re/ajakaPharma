const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { MRRequest } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mr-reporting-system';

async function checkPendingRequests() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all pending requests
    const pendingRequests = await MRRequest.find({ status: 'pending' });
    
    console.log('📋 Pending MR Requests:', pendingRequests.length);
    console.log('');
    
    if (pendingRequests.length === 0) {
      console.log('ℹ️  No pending requests found');
      console.log('');
      console.log('💡 To test approval email:');
      console.log('   1. Go to http://localhost:5173/request-mr-access');
      console.log('   2. Fill the form with YOUR email (suraj6re@gmail.com)');
      console.log('   3. Submit the application');
      console.log('   4. Go to admin panel and approve it');
      console.log('   5. Check your email inbox');
    } else {
      pendingRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.name}`);
        console.log(`   Email: ${req.email}`);
        console.log(`   Phone: ${req.phone}`);
        console.log(`   Area: ${req.area}`);
        console.log(`   Applied: ${req.createdAt.toLocaleString()}`);
        console.log(`   ID: ${req._id}`);
        console.log('');
      });
      
      console.log('⚠️  IMPORTANT:');
      console.log('   Approval emails are sent to the applicant\'s email address');
      console.log(`   Current applicants: ${pendingRequests.map(r => r.email).join(', ')}`);
      console.log('');
      console.log('💡 To receive the approval email yourself:');
      console.log('   1. Create a new application with YOUR email (suraj6re@gmail.com)');
      console.log('   2. Then approve it from the admin panel');
      console.log('   3. You will receive the email with credentials');
    }
    
    // Get all requests
    const allRequests = await MRRequest.find();
    console.log('');
    console.log('📊 Total Requests:', allRequests.length);
    console.log('   Pending:', allRequests.filter(r => r.status === 'pending').length);
    console.log('   Approved:', allRequests.filter(r => r.status === 'approved').length);
    console.log('   Rejected:', allRequests.filter(r => r.status === 'rejected').length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Connection closed');
  }
}

checkPendingRequests();
