const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },

  // Order References
  mr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  visitReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitReport'
  },

  // Order Details
  orderDetails: {
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    orderType: {
      type: String,
      enum: ['Doctor Order', 'Stockist Order', 'Sample Order'],
      default: 'Doctor Order'
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  },

  // Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // Percentage
    taxRate: { type: Number, default: 0 }, // Percentage
    totalAmount: { type: Number }
  }],

  // Financial Details
  financial: {
    subtotal: { type: Number, default: 0 },
    totalDiscount: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },

  // Delivery Information
  delivery: {
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      landmark: { type: String }
    },
    contactPerson: { type: String },
    contactPhone: { type: String },
    deliveryInstructions: { type: String }
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  statusHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  }],

  // Additional Information
  notes: { type: String },
  internalNotes: { type: String },
  cancellationReason: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate orderId and calculate totals
orderSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  if (!this.orderId) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      const nextNumber = String(count + 1).padStart(6, '0');
      this.orderId = `ORD${nextNumber}`;
    } catch (err) {
      return next(err);
    }
  }

  // Calculate item totals
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTax = 0;

  this.items.forEach(item => {
    const itemTotal = item.unitPrice * item.quantity;
    const discountAmount = (itemTotal * item.discount) / 100;
    const taxableAmount = itemTotal - discountAmount;
    const taxAmount = (taxableAmount * item.taxRate) / 100;

    item.totalAmount = taxableAmount + taxAmount;
    subtotal += itemTotal;
    totalDiscount += discountAmount;
    totalTax += taxAmount;
  });

  this.financial.subtotal = subtotal;
  this.financial.totalDiscount = totalDiscount;
  this.financial.totalTax = totalTax;
  this.financial.grandTotal = subtotal - totalDiscount + totalTax + this.financial.shippingCharges;

  next();
});

module.exports = mongoose.model('Order', orderSchema);