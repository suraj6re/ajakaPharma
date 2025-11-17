const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');

async function verifyOmkarLogin() {
  const API_URL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Omkar\'s login...\n');
  
  const credentials = {
    email: 'omkarrangole444@gmail.com',
    password: 'Z6VDAAWQOO',
    role: 'MR'
  };
  
  console.log('Credentials:');
  console.log('   Email:', credentials.email);
  console.log('   Password:', credentials.password);
  console.log('   Role:', credentials.role);
  console.log('');
  
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('');
    console.log('Response:');
    console.log('   Status:', response.status);
    console.log('   Token:', response.data.data.token.substring(0, 30) + '...');
    console.log('   User:', response.data.data.user.name);
    console.log('   Role:', response.data.data.user.role);
    console.log('   Employee ID:', response.data.data.user.employeeId);
    console.log('');
    console.log('🎉 Omkar can now login to the system!');
  } catch (error) {
    console.log('❌ LOGIN FAILED!');
    console.log('');
    console.log('Error:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message);
  }
}

console.log('⚠️  Make sure server is running: npm run dev\n');
verifyOmkarLogin();
