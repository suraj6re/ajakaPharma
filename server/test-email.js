const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Service with Nodemailer...\n');
  
  console.log('📧 Email Configuration:');
  console.log('   User:', process.env.EMAIL_USER);
  console.log('   Sender Name:', process.env.EMAIL_SENDER_NAME);
  console.log('   App Password:', process.env.EMAIL_APP_PASSWORD ? '✅ Configured' : '❌ Missing');
  console.log('');
  
  try {
    // Test 1: Simple test email
    console.log('📤 Test 1: Sending test email...');
    const result1 = await emailService.sendEmail(
      process.env.EMAIL_USER,
      'Test Email - MR Reporting System',
      `
        <h1>Test Email</h1>
        <p>This is a test email from the MR Reporting System.</p>
        <p>If you receive this, Nodemailer is working correctly!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `
    );
    
    if (result1.success) {
      console.log('✅ Test 1 PASSED - Email sent successfully');
      console.log('   Message ID:', result1.messageId);
    } else {
      console.log('❌ Test 1 FAILED:', result1.error);
    }
    console.log('');
    
    // Test 2: Application received email
    console.log('📤 Test 2: Sending application received email...');
    const result2 = await emailService.sendApplicationReceivedEmail(
      'Test User',
      process.env.EMAIL_USER,
      '+91 98765 43210',
      'Mumbai'
    );
    
    if (result2.success) {
      console.log('✅ Test 2 PASSED - Application email sent');
    } else {
      console.log('❌ Test 2 FAILED:', result2.error);
    }
    console.log('');
    
    // Test 3: Approval email
    console.log('📤 Test 3: Sending approval email...');
    const result3 = await emailService.sendApprovalEmail(
      process.env.EMAIL_USER,
      'TEST123'
    );
    
    if (result3.success) {
      console.log('✅ Test 3 PASSED - Approval email sent');
    } else {
      console.log('❌ Test 3 FAILED:', result3.error);
    }
    console.log('');
    
    // Test 4: Rejection email
    console.log('📤 Test 4: Sending rejection email...');
    const result4 = await emailService.sendRejectionEmail(
      process.env.EMAIL_USER
    );
    
    if (result4.success) {
      console.log('✅ Test 4 PASSED - Rejection email sent');
    } else {
      console.log('❌ Test 4 FAILED:', result4.error);
    }
    console.log('');
    
    console.log('🎉 Email testing complete!');
    console.log('📬 Check your inbox at:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testEmail();
