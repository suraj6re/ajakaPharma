require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

async function checkDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const count = await Doctor.countDocuments();
    console.log(`📊 Total doctors in database: ${count}`);

    if (count > 0) {
      const doctors = await Doctor.find().limit(5);
      console.log('\n📋 Sample doctors:');
      doctors.forEach(d => {
        console.log(`  - ${d.name} (${d.place})`);
      });

      // Get unique places
      const places = await Doctor.distinct('place');
      console.log(`\n🏙️ Unique places (${places.length}):`);
      places.slice(0, 10).forEach(p => console.log(`  - ${p}`));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDoctors();
