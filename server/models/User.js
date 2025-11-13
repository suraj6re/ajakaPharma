const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Auth Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['MR', 'Admin', 'Manager'], 
    required: true 
  },
  
  // Optional fields for compatibility
  employeeId: { type: String, unique: true, sparse: true },
  phone: { type: String },
  territory: { type: String },
  region: { type: String },
  city: { type: String },
  joiningDate: { type: Date, default: Date.now },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Performance Targets
  monthlyVisits: { type: Number, default: 0 },
  monthlySales: { type: Number, default: 0 },
  quarterlyTarget: { type: Number, default: 0 },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
