const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  targetId: { type: String, unique: true },
  
  // Target Assignment
  mr: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Target Period
  period: {
    type: { 
      type: String, 
      enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], 
      required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    month: { type: Number }, // 1-12
    quarter: { type: Number }, // 1-4
    year: { type: Number, required: true }
  },
  
  // Visit Targets
  visitTargets: {
    totalVisits: { type: Number, default: 0 },
    newDoctorVisits: { type: Number, default: 0 },
    followUpVisits: { type: Number, default: 0 },
    dailyVisitTarget: { type: Number, default: 0 }
  },
  
  // Sales Targets
  salesTargets: {
    totalSalesValue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    newCustomerOrders: { type: Number, default: 0 },
    productWiseTargets: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      targetQuantity: { type: Number },
      targetValue: { type: Number }
    }]
  },
  
  // Territory Targets
  territoryTargets: {
    doctorCoverage: { type: Number, default: 0 }, // Percentage
    marketPenetration: { type: Number, default: 0 }, // Percentage
    newDoctorAcquisition: { type: Number, default: 0 }
  },
  
  // Achievement Tracking
  achievements: {
    visitsCompleted: { type: Number, default: 0 },
    salesAchieved: { type: Number, default: 0 },
    ordersCompleted: { type: Number, default: 0 },
    newDoctorsAdded: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Status
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Cancelled'], 
    default: 'Active' 
  },
  
  // Notes
  notes: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate targetId
targetSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (!this.targetId) {
    try {
      const count = await mongoose.model('Target').countDocuments();
      const nextNumber = String(count + 1).padStart(4, '0');
      this.targetId = `TGT${nextNumber}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Calculate achievement percentages
targetSchema.methods.calculateAchievementPercentages = function() {
  return {
    visitAchievement: this.visitTargets.totalVisits > 0 ? 
      (this.achievements.visitsCompleted / this.visitTargets.totalVisits) * 100 : 0,
    salesAchievement: this.salesTargets.totalSalesValue > 0 ? 
      (this.achievements.salesAchieved / this.salesTargets.totalSalesValue) * 100 : 0,
    orderAchievement: this.salesTargets.totalOrders > 0 ? 
      (this.achievements.ordersCompleted / this.salesTargets.totalOrders) * 100 : 0
  };
};

module.exports = mongoose.model('Target', targetSchema);