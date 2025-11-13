const mongoose = require('mongoose');

const mrTargetSchema = new mongoose.Schema({
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
  
  // Visit Targets
  target_visits: { 
    type: Number, 
    default: 0 
  },
  
  // Sales Targets
  target_sales: { 
    type: Number, 
    default: 0 
  },
  
  // Additional Target Metrics
  target_new_doctors: {
    type: Number,
    default: 0
  },
  target_orders: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Pending'],
    default: 'Active'
  },
  
  // Notes
  notes: {
    type: String
  },
  
  // Created By (Admin/Manager)
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Compound index to ensure unique target per MR per month/year
mrTargetSchema.index({ mr: 1, month: 1, year: 1 }, { unique: true });

// Virtual for target period display
mrTargetSchema.virtual('period').get(function() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[this.month - 1]} ${this.year}`;
});

// Ensure virtual fields are serialized
mrTargetSchema.set('toJSON', { virtuals: true });
mrTargetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MRTarget', mrTargetSchema);
