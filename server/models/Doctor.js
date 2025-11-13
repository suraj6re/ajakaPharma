const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  // Simple fields matching your data structure
  srNo: { type: Number },
  name: { type: String, required: true },
  qualification: { type: String },
  place: { type: String, required: true }, // City/Location
  
  // Optional fields for future use
  specialization: { type: String },
  phone: { type: String },
  email: { type: String },
  
  // MR Assignment
  assignedMR: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate srNo if not provided
doctorSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  
  if (!this.srNo) {
    try {
      const count = await mongoose.model('Doctor').countDocuments();
      this.srNo = count + 1;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Virtual fields for backward compatibility with old code
doctorSchema.virtual('city').get(function () {
  return this.place;
});

doctorSchema.virtual('location').get(function () {
  return this.place;
});

// Ensure virtual fields are serialized
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);