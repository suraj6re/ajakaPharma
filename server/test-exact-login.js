const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');

async function testExactLogin() {
  const API_URL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing EXACT login scenarios\n');
  
  // Test 1: Exact browser request
  console.log('📝 Test 1: Simulating EXACT browser request');
  console.log('   (This is what the browser sends)');
  console.log('');
  
  const browserRequest = {
    email: 'mr@ajaka.com',
    password: 'mr123',
    role: 'MR'
  };
  
  console.log('Request body:', JSON.stringify(browserRequest, null, 2));
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, browserRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Token:', response.data.data.token.substring(0, 30) + '...');
    console.log('User:', response.data.data.user.name);
    console.log('Role:', response.data.data.user.role);
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Check what's in database
  console.log('📝 Test 2: Checking database directly');
  console.log('');
  
  const mongoose = require('mongoose');
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ email: 'mr@ajaka.com' });
  
  if (user) {
    console.log('User found in database:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Active:', user.isActive);
    console.log('   Password hash:', user.password.substring(0, 30) + '...');
    console.log('');
    
    // Test password
    const testPasswords = ['mr123', 'MR123', 'Mr123', 'mr@123', 'MR@123'];
    console.log('Testing passwords:');
    for (const pwd of testPasswords) {
      const match = await bcrypt.compare(pwd, user.password);
      console.log(`   ${pwd}: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
  } else {
    console.log('❌ User NOT found in database!');
  }
  
  await mongoose.connection.close();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Different variations
  console.log('📝 Test 3: Testing variations');
  console.log('');
  
  const variations = [
    { email: 'mr@ajaka.com', password: 'mr123', role: 'MR' },
    { email: 'mr@ajaka.com', password: 'mr123', role: 'mr' },
    { email: 'mr@ajaka.com', password: 'mr123' },
    { email: 'MR@ajaka.com', password: 'mr123', role: 'MR' },
  ];
  
  for (let i = 0; i < variations.length; i++) {
    const req = variations[i];
    console.log(`Variation ${i + 1}:`, JSON.stringify(req));
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, req);
      console.log('   ✅ SUCCESS');
    } catch (error) {
      console.log('   ❌ FAILED:', error.response?.data?.message);
    }
  }
}

console.log('⚠️  Make sure server is running: npm run dev\n');
testExactLogin().catch(console.error);
