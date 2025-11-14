const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Doctor, Product, VisitReport } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mr-reporting-system';

console.log('📍 Loading .env from:', path.join(__dirname, '..', '.env'));
console.log('🔗 MongoDB URI:', MONGODB_URI.substring(0, 30) + '...');

// Sample MR data with realistic Indian names
const sampleMRs = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR001',
    phone: '+91 98765 43210',
    territory: 'Mumbai Central',
    region: 'Western Region',
    city: 'Mumbai'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR002',
    phone: '+91 98765 43211',
    territory: 'Delhi NCR',
    region: 'Northern Region',
    city: 'New Delhi'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR003',
    phone: '+91 98765 43212',
    territory: 'Bangalore South',
    region: 'Southern Region',
    city: 'Bangalore'
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR004',
    phone: '+91 98765 43213',
    territory: 'Hyderabad East',
    region: 'Southern Region',
    city: 'Hyderabad'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR005',
    phone: '+91 98765 43214',
    territory: 'Pune West',
    region: 'Western Region',
    city: 'Pune'
  },
  {
    name: 'Anjali Verma',
    email: 'anjali.verma@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR006',
    phone: '+91 98765 43215',
    territory: 'Chennai North',
    region: 'Southern Region',
    city: 'Chennai'
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul.gupta@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR007',
    phone: '+91 98765 43216',
    territory: 'Kolkata Central',
    region: 'Eastern Region',
    city: 'Kolkata'
  },
  {
    name: 'Kavita Desai',
    email: 'kavita.desai@ajakapharma.com',
    password: 'password123',
    role: 'MR',
    employeeId: 'MR008',
    phone: '+91 98765 43217',
    territory: 'Ahmedabad West',
    region: 'Western Region',
    city: 'Ahmedabad'
  }
];

// Function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to get random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Function to get random date in the last 90 days
const getRandomDate = (daysBack = 90) => {
  const date = new Date();
  date.setDate(date.getDate() - getRandomNumber(0, daysBack));
  return date;
};

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create MRs
    console.log('\n👥 Creating sample MRs...');
    const createdMRs = [];
    
    for (const mrData of sampleMRs) {
      // Check if MR already exists
      let mr = await User.findOne({ email: mrData.email });
      
      if (!mr) {
        // Hash password
        const hashedPassword = await bcrypt.hash(mrData.password, 10);
        mr = await User.create({
          ...mrData,
          password: hashedPassword
        });
        console.log(`✅ Created MR: ${mr.name} (${mr.email})`);
      } else {
        console.log(`⏭️  MR already exists: ${mr.name}`);
      }
      
      createdMRs.push(mr);
    }

    // Get existing doctors and products
    console.log('\n🏥 Fetching existing doctors...');
    const doctors = await Doctor.find().limit(50);
    console.log(`✅ Found ${doctors.length} doctors`);

    console.log('\n💊 Fetching existing products...');
    const products = await Product.find().limit(20);
    console.log(`✅ Found ${products.length} products`);

    if (doctors.length === 0) {
      console.log('⚠️  No doctors found. Please add doctors first.');
      return;
    }

    if (products.length === 0) {
      console.log('⚠️  No products found. Please add products first.');
      return;
    }

    // Create visit reports
    console.log('\n📋 Creating sample visit reports...');
    const visitStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'];
    const visitOutcomes = ['Positive', 'Neutral', 'Negative'];
    const interestLevels = ['High', 'Medium', 'Low'];
    
    let visitCount = 0;
    
    for (const mr of createdMRs) {
      // Create 5-15 visits per MR
      const numVisits = getRandomNumber(5, 15);
      
      for (let i = 0; i < numVisits; i++) {
        const doctor = getRandomItem(doctors);
        const numProducts = getRandomNumber(1, 3);
        const selectedProducts = [];
        
        for (let j = 0; j < numProducts; j++) {
          selectedProducts.push(getRandomItem(products));
        }
        
        const productsDiscussed = selectedProducts.map(product => ({
          product: product._id,
          samplesGiven: getRandomNumber(0, 5),
          interestLevel: getRandomItem(interestLevels),
          doctorFeedback: getRandomItem([
            'Very interested in the product',
            'Wants more information',
            'Already prescribing similar medication',
            'Will consider for future patients',
            'Positive response to clinical data'
          ])
        }));
        
        // 30% chance of having orders
        const hasOrders = Math.random() > 0.7;
        const orders = hasOrders ? selectedProducts.slice(0, getRandomNumber(1, 2)).map(product => ({
          product: product._id,
          quantity: getRandomNumber(10, 100),
          unitPrice: product.businessInfo?.mrp || 100
        })) : [];
        
        const visitData = {
          mr: mr._id,
          doctor: doctor._id,
          visitDetails: {
            visitDate: getRandomDate(90),
            duration: getRandomNumber(15, 60),
            visitType: getRandomItem(['Scheduled', 'Cold Call', 'Follow-up', 'Emergency'])
          },
          interaction: {
            productsDiscussed,
            notes: getRandomItem([
              'Doctor showed great interest in our new product line',
              'Discussed clinical trial results and efficacy data',
              'Doctor requested more samples for patient trials',
              'Positive feedback on product quality and pricing',
              'Scheduled follow-up meeting next month',
              'Doctor appreciated the detailed product information',
              'Discussed competitive advantages over similar products'
            ]),
            visitOutcome: getRandomItem(visitOutcomes)
          },
          orders,
          status: getRandomItem(visitStatuses)
        };
        
        // Check if similar visit already exists
        const existingVisit = await VisitReport.findOne({
          mr: mr._id,
          doctor: doctor._id,
          'visitDetails.visitDate': visitData.visitDetails.visitDate
        });
        
        if (!existingVisit) {
          await VisitReport.create(visitData);
          visitCount++;
        }
      }
    }
    
    console.log(`✅ Created ${visitCount} visit reports`);

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ MRs: ${createdMRs.length}`);
    console.log(`✅ Doctors: ${doctors.length}`);
    console.log(`✅ Products: ${products.length}`);
    console.log(`✅ Visit Reports: ${visitCount}`);
    
    console.log('\n🎉 Sample data seeding completed successfully!');
    console.log('\n📝 Sample MR Credentials:');
    console.log('Email: rajesh.kumar@ajakapharma.com');
    console.log('Password: password123');
    console.log('\nYou can use any of the MR emails listed above with password: password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding
seedDatabase();
