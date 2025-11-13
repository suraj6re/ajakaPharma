require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

async function checkDoctorActive() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ isActive: true });
    const inactiveDoctors = await Doctor.countDocuments({ isActive: false });
    const noActiveField = await Doctor.countDocuments({ isActive: { $exists: false } });

    console.log(`📊 Total doctors: ${totalDoctors}`);
    console.log(`✅ Active doctors (isActive: true): ${activeDoctors}`);
    console.log(`❌ Inactive doctors (isActive: false): ${inactiveDoctors}`);
    console.log(`⚠️  No isActive field: ${noActiveField}`);

    // Sample doctor
    const sampleDoctor = await Doctor.findOne();
    console.log('\n📋 Sample doctor:');
    console.log(JSON.stringify(sampleDoctor, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDoctorActive();
