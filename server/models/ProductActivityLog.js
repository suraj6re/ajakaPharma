const mongoose = require('mongoose');

const productActivitySchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  mr: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  },
  
  // Activity Details
  activity_type: {
    type: String,
    enum: ['Discussion', 'Sample Given', 'Literature Provided', 'Order Placed', 'Feedback Received'],
    default: 'Discussion'
  },
  
  date: { 
    type: Date, 
    default: Date.now 
  },
  
  // Quantity Metrics
  quantity: {
    type: Number,
    default: 0
  },
  
  // Feedback and Notes
  doctor_feedback: {
    type: String
  },
  interest_level: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  // Outcome
  outcome: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative'],
    default: 'Neutral'
  },
  
  // Related Visit Report
  visit_report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitReport'
  },
  
  // Related Order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Additional Context
  notes: {
    type: String
  },
  
  // Location (optional)
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  }
}, { 
  timestamps: true 
});

// Indexes for efficient querying
productActivitySchema.index({ product: 1, date: -1 });
productActivitySchema.index({ mr: 1, date: -1 });
productActivitySchema.index({ doctor: 1, date: -1 });
productActivitySchema.index({ activity_type: 1, date: -1 });

// Virtual for activity summary
productActivitySchema.virtual('summary').get(function() {
  return `${this.activity_type} - ${this.outcome}`;
});

// Static method to get product analytics
productActivitySchema.statics.getProductAnalytics = async function(productId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$activity_type',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
};

// Static method to get MR product activity summary
productActivitySchema.statics.getMRProductSummary = async function(mrId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        mr: mongoose.Types.ObjectId(mrId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$product',
        totalActivities: { $sum: 1 },
        uniqueDoctors: { $addToSet: '$doctor' },
        totalQuantity: { $sum: '$quantity' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    }
  ]);
};

// Ensure virtual fields are serialized
productActivitySchema.set('toJSON', { virtuals: true });
productActivitySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ProductActivityLog', productActivitySchema);
