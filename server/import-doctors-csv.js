/**
 * Script to import doctors from CSV file
 * CSV Format: Sr.No.,DoctorName,Qualification,Place
 * Run with: node import-doctors-csv.js doctors.csv
 */

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');

const importDoctorsFromCSV = async (csvFilePath) => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error('❌ Error: CSV file not found:', csvFilePath);
      console.log('\n📝 Usage: node import-doctors-csv.js <path-to-csv-file>');
      console.log('Example: node import-doctors-csv.js doctors.csv');
      process.exit(1);
    }

    console.log('📄 Reading CSV file:', csvFilePath);
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Split into lines and remove empty lines
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length === 0) {
      console.error('❌ Error: CSV file is empty');
      process.exit(1);
    }

    // Get header line
    const header = lines[0];
    console.log('📋 CSV Header:', header);
    
    // Parse header to get column positions
    const columns = header.split(',').map(col => col.trim());
    console.log('📊 Columns found:', columns.join(', '));
    
    // Find column indices (case-insensitive)
    const srNoIndex = columns.findIndex(col => 
      col.toLowerCase().includes('sr') || col.toLowerCase().includes('no')
    );
    const nameIndex = columns.findIndex(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('doctor')
    );
    const qualificationIndex = columns.findIndex(col => 
      col.toLowerCase().includes('qualification') || col.toLowerCase().includes('qual')
    );
    const placeIndex = columns.findIndex(col => 
      col.toLowerCase().includes('place') || col.toLowerCase().includes('city') || col.toLowerCase().includes('location')
    );

    console.log('\n🔍 Column Mapping:');
    console.log('  Sr.No. → Column', srNoIndex + 1);
    console.log('  Name → Column', nameIndex + 1);
    console.log('  Qualification → Column', qualificationIndex + 1);
    console.log('  Place → Column', placeIndex + 1);

    if (nameIndex === -1 || placeIndex === -1) {
      console.error('\n❌ Error: Required columns not found!');
      console.log('Required: DoctorName, Place');
      console.log('Found:', columns.join(', '));
      process.exit(1);
    }

    // Parse data rows
    const doctors = [];
    let skipped = 0;
    let errors = 0;

    console.log('\n📥 Importing doctors...\n');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Split by comma, but handle quoted values
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

        const srNo = srNoIndex >= 0 ? parseInt(cleanValues[srNoIndex]) : i;
        const name = nameIndex >= 0 ? cleanValues[nameIndex] : '';
        const qualification = qualificationIndex >= 0 ? cleanValues[qualificationIndex] : '';
        const place = placeIndex >= 0 ? cleanValues[placeIndex] : '';

        // Validate required fields
        if (!name || !place) {
          console.log(`⏭️  Row ${i + 1}: Skipping - missing name or place`);
          skipped++;
          continue;
        }

        // Check if doctor already exists
        const existing = await Doctor.findOne({ 
          name: name,
          place: place 
        });

        if (existing) {
          console.log(`⏭️  Row ${i + 1}: ${name} (${place}) - already exists`);
          skipped++;
          continue;
        }

        // Create doctor object
        const doctorData = {
          srNo: isNaN(srNo) ? i : srNo,
          name: name,
          qualification: qualification || '',
          place: place,
          isActive: true
        };

        doctors.push(doctorData);
        console.log(`✅ Row ${i + 1}: ${name} - ${place}`);

      } catch (error) {
        console.error(`❌ Row ${i + 1}: Error -`, error.message);
        errors++;
      }
    }

    // Insert doctors into MongoDB
    if (doctors.length > 0) {
      console.log('\n💾 Saving to MongoDB...');
      await Doctor.insertMany(doctors);
      console.log('✅ Saved successfully!');
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Imported:', doctors.length, 'doctors');
    console.log('⏭️  Skipped:', skipped, '(duplicates or invalid)');
    console.log('❌ Errors:', errors);
    console.log('📄 Total rows:', lines.length - 1);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (doctors.length > 0) {
      console.log('\n🎉 Import completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Verify doctors in MongoDB');
      console.log('2. Restart your backend server');
      console.log('3. Test the Report Visit page');
    } else {
      console.log('\n⚠️  No new doctors were imported');
      console.log('All doctors may already exist in the database');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error importing doctors:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Get CSV file path from command line argument
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.log('📝 Usage: node import-doctors-csv.js <path-to-csv-file>');
  console.log('\nExample:');
  console.log('  node import-doctors-csv.js doctors.csv');
  console.log('  node import-doctors-csv.js ../data/doctors.csv');
  console.log('\n📋 CSV Format:');
  console.log('  Sr.No.,DoctorName,Qualification,Place');
  console.log('  1,Dr. John Doe,MBBS MD,Mumbai');
  console.log('  2,Dr. Jane Smith,MBBS,Delhi');
  process.exit(1);
}

// Run the import
importDoctorsFromCSV(csvFilePath);
