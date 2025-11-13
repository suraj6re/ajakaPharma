const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true, sparse: true, index: true },
  
  // Basic Information
  basicInfo: {
    name: { type: String, required: true },
    brandName: { type: String },
    genericName: { type: String },
    category: { type: String, required: true },
    subCategory: { type: String },
    description: { type: String },
    productImage: { type: String, default: '' }
  },
  
  // Medical Information
  medicalInfo: {
    composition: { type: String },
    dosageForm: { type: String }, // Tablet, Capsule, Syrup, etc.
    strength: { type: String }, // 500mg, 10ml, etc.
    indication: { type: String }, // What it treats
    contraindications: { type: String },
    sideEffects: { type: String },
    dosage: { type: String }, // How to take
    storageConditions: { type: String }
  },
  
  // Business Information
  businessInfo: {
    mrp: { type: Number, required: true },
    dealerPrice: { type: Number },
    distributorPrice: { type: Number },
    margin: { type: Number }, // Percentage
    packSize: { type: String }, // 10 tablets, 100ml, etc.
    manufacturer: { type: String },
    manufacturerLicense: { type: String },
    hsnCode: { type: String }
  },
  
  // Inventory Management
  inventory: {
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    maxStockLevel: { type: Number },
    lastRestocked: { type: Date },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    location: { type: String } // Warehouse location
  },
  
  // Regulatory Information
  regulatory: {
    drugLicenseNumber: { type: String },
    scheduleDrug: { type: String }, // H, H1, X, etc.
    prescriptionRequired: { type: Boolean, default: false },
    approvalDate: { type: Date },
    withdrawalDate: { type: Date }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isDiscontinued: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate incremental productId like PROD0001 if not provided
productSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  
  if (!this.productId) {
    try {
      const count = await mongoose.model('Product').countDocuments();
      const nextNumber = String(count + 1).padStart(4, '0');
      this.productId = `PROD${nextNumber}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual fields for backward compatibility
productSchema.virtual('product_id').get(function() {
  return this.productId;
});

productSchema.virtual('product_name').get(function() {
  return this.basicInfo.name;
});

productSchema.virtual('name').get(function() {
  return this.basicInfo.name;
});

productSchema.virtual('category').get(function() {
  return this.basicInfo.category;
});

productSchema.virtual('price').get(function() {
  return this.businessInfo.mrp;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);