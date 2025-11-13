const mongoose = require('mongoose');

const visitReportSchema = new mongoose.Schema({
  visitId: { type: String, unique: true },
  
  // Core References
  mr: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true 
  },
  
  // Visit Details
  visitDetails: {
    visitDate: { type: Date, default: Date.now },
    visitTime: { type: String }, // HH:MM format
    duration: { type: Number }, // Duration in minutes
    visitType: { 
      type: String, 
      enum: ['Scheduled', 'Cold Call', 'Follow-up', 'Emergency'], 
      default: 'Scheduled' 
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      verified: { type: Boolean, default: false }
    },
    nextVisitDate: { type: Date }
  },
  
  // Interaction Details
  interaction: {
    productsDiscussed: [{ 
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      samplesGiven: { type: Number, default: 0 },
      literatureProvided: { type: Boolean, default: false },
      doctorFeedback: { type: String },
      interestLevel: { 
        type: String, 
        enum: ['High', 'Medium', 'Low'], 
        default: 'Medium' 
      }
    }],
    notes: { type: String, required: true },
    visitOutcome: { 
      type: String, 
      enum: ['Positive', 'Neutral', 'Negative'], 
      default: 'Neutral' 
    },
    doctorAvailability: { 
      type: String, 
      enum: ['Available', 'Busy', 'Not Available'], 
      default: 'Available' 
    },
    competitorActivity: { type: String }
  },
  
  // Orders Placed
  orders: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number },
    totalAmount: { type: Number },
    deliveryDate: { type: Date },
    priority: { 
      type: String, 
      enum: ['High', 'Medium', 'Low'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], 
      default: 'Pending' 
    },
    notes: { type: String }
  }],
  
  // Attachments
  attachments: [{
    fileName: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Status and Approval
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'], 
    default: 'Submitted' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate visitId if not provided
visitReportSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  if (!this.visitId) {
    try {
      const count = await mongoose.model('VisitReport').countDocuments();
      const nextNumber = String(count + 1).padStart(6, '0');
      this.visitId = `VIS${nextNumber}`;
    } catch (err) {
      return next(err);
    }
  }
  
  // Calculate total amounts for orders
  this.orders.forEach(order => {
    if (order.unitPrice && order.quantity) {
      order.totalAmount = order.unitPrice * order.quantity;
    }
  });
  
  next();
});

// Virtual fields for backward compatibility
visitReportSchema.virtual('visitDate').get(function() {
  return this.visitDetails.visitDate;
});

visitReportSchema.virtual('productsDiscussed').get(function() {
  return this.interaction.productsDiscussed.map(p => p.product);
});

visitReportSchema.virtual('notes').get(function() {
  return this.interaction.notes;
});

// Ensure virtual fields are serialized
visitReportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('VisitReport', visitReportSchema);
