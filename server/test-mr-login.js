const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');

async function testMRLogin() {
  try {
    console.log('🧪 Testing MR Login...\n');
    
    const API_URL = 'http://localhost:5000/api';
    
    // Test 1: Login with role="MR"
    console.log('📝 Test 1: Login as MR with role parameter');
    console.log('   Email: mr@ajaka.com');
    console.log('   Password: mr123');
    console.log('   Role: MR');
    console.log('');
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'mr@ajaka.com',
        password: 'mr123',
        role: 'MR'
      });
      
      console.log('✅ Login successful!');
      console.log('   Token:', response.data.data.token.substring(0, 20) + '...');
      console.log('   User:', response.data.data.user.name);
      console.log('   Role:', response.data.data.user.role);
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
    }
    
    console.log('');
    
    // Test 2: Login without role parameter
    console.log('📝 Test 2: Login as MR without role parameter');
    console.log('   Email: mr@ajaka.com');
    console.log('   Password: mr123');
    console.log('');
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'mr@ajaka.com',
        password: 'mr123'
      });
      
      console.log('✅ Login successful!');
      console.log('   Token:', response.data.data.token.substring(0, 20) + '...');
      console.log('   User:', response.data.data.user.name);
      console.log('   Role:', response.data.data.user.role);
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
    console.log('');
    
    // Test 3: Login as Admin
    console.log('📝 Test 3: Login as Admin');
    console.log('   Email: admin@ajaka.com');
    console.log('   Password: admin123');
    console.log('   Role: Admin');
    console.log('');
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: 'admin@ajaka.com',
        password: 'admin123',
        role: 'Admin'
      });
      
      console.log('✅ Login successful!');
      console.log('   Token:', response.data.data.token.substring(0, 20) + '...');
      console.log('   User:', response.data.data.user.name);
      console.log('   Role:', response.data.data.user.role);
    } catch (error) {
      console.log('❌ Login failed!');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

console.log('⚠️  Make sure the server is running on port 5000');
console.log('   Run: cd server && npm run dev');
console.log('');

testMRLogin();
