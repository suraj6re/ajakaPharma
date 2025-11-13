require('dotenv').config();
const mongoose = require('mongoose');

async function fixProductIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // Drop the problematic index
    try {
      await collection.dropIndex('productId_1');
      console.log('✅ Dropped old productId index');
    } catch (err) {
      console.log('⚠️  Index might not exist:', err.message);
    }

    // Create new sparse unique index
    await collection.createIndex({ productId: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse unique index on productId');

    // Count products
    const count = await collection.countDocuments();
    console.log(`\n📊 Total products: ${count}`);

    // Show products without productId
    const withoutId = await collection.countDocuments({ productId: null });
    console.log(`⚠️  Products without productId: ${withoutId}`);

    if (withoutId > 0) {
      console.log('\n🔧 Generating productIds for existing products...');
      const products = await collection.find({ productId: null }).toArray();
      
      for (let i = 0; i < products.length; i++) {
        const nextNumber = String(count + i + 1).padStart(4, '0');
        const productId = `PROD${nextNumber}`;
        
        await collection.updateOne(
          { _id: products[i]._id },
          { $set: { productId: productId } }
        );
        console.log(`  ✓ Set productId for ${products[i].basicInfo?.name || 'Unknown'}: ${productId}`);
      }
      console.log('\n✅ All products now have productIds!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProductIndex();
