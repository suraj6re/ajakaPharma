const mongoose = require('mongoose');

const mrPerformanceSchema = new mongoose.Schema({
  mr: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  month: { 
    type: Number, 
    required: true,
    min: 1,
    max: 12
  },
  year: { 
    type: Number, 
    required: true 
  },
  
  // Visit Metrics
  total_visits: { 
    type: Number, 
    default: 0 
  },
  unique_doctors_visited: {
    type: Number,
    default: 0
  },
  new_doctors_added: {
    type: Number,
    default: 0
  },
  
  // Order Metrics
  total_orders: { 
    type: Number, 
    default: 0 
  },
  total_sale_amount: { 
    type: Number, 
    default: 0 
  },
  average_order_value: {
    type: Number,
    default: 0
  },
  
  // Product Metrics
  products_discussed: {
    type: Number,
    default: 0
  },
  samples_distributed: {
    type: Number,
    default: 0
  },
  
  // Performance Indicators
  target_achievement_percentage: {
    type: Number,
    default: 0
  },
  visit_success_rate: {
    type: Number,
    default: 0
  },
  
  // Ranking
  rank_in_region: {
    type: Number
  },
  rank_overall: {
    type: Number
  },
  
  // Additional Metrics
  working_days: {
    type: Number,
    default: 0
  },
  average_visits_per_day: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Verified'],
    default: 'In Progress'
  },
  
  // Verification
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified_at: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String
  }
}, { 
  timestamps: true 
});

// Compound index to ensure unique performance log per MR per month/year
mrPerformanceSchema.index({ mr: 1, month: 1, year: 1 }, { unique: true });

// Virtual for performance period display
mrPerformanceSchema.virtual('period').get(function() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[this.month - 1]} ${this.year}`;
});

// Method to calculate average visits per day
mrPerformanceSchema.methods.calculateAverages = function() {
  if (this.working_days > 0) {
    this.average_visits_per_day = (this.total_visits / this.working_days).toFixed(2);
  }
  if (this.total_orders > 0) {
    this.average_order_value = (this.total_sale_amount / this.total_orders).toFixed(2);
  }
};

// Pre-save hook to calculate averages
mrPerformanceSchema.pre('save', function(next) {
  this.calculateAverages();
  next();
});

// Ensure virtual fields are serialized
mrPerformanceSchema.set('toJSON', { virtuals: true });
mrPerformanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MRPerformanceLog', mrPerformanceSchema);
