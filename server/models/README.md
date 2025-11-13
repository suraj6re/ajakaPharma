# Database Models Documentation

## Overview
This directory contains all Mongoose models for the MR Reporting System. The models are designed to support comprehensive medical representative tracking, doctor management, product catalog, and performance analytics.

## Models Structure

### Core Models

#### 1. **User.js**
Stores admin and MR profiles with comprehensive work and personal information.

**Key Fields:**
- `firebaseUid`: Firebase authentication ID
- `employeeId`: Unique employee identifier
- `personalInfo`: Name, email, phone, profile picture
- `workInfo`: Role, territory, region, reporting manager
- `targets`: Monthly/quarterly performance targets

**Usage:**
```javascript
const { User } = require('./models');

// Create new MR user
const newMR = new User({
  firebaseUid: 'firebase-uid-123',
  employeeId: 'EMP001',
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210'
  },
  workInfo: {
    role: 'MR',
    territory: 'Mumbai',
    region: 'West'
  }
});
await newMR.save();
```

#### 2. **Doctor.js**
Master doctor directory with practice and contact information.

**Key Fields:**
- `doctorId`: Auto-generated (DOC0001, DOC0002, etc.)
- `personalInfo`: Name, qualification, specialization
- `contactInfo`: Phone, email, address
- `practiceInfo`: Hospital/clinic details, timings
- `assignedMRs`: Array of MR references

**Usage:**
```javascript
const { Doctor } = require('./models');

const newDoctor = new Doctor({
  personalInfo: {
    name: 'Dr. Smith',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD'
  },
  contactInfo: {
    phone: '9876543211',
    address: { city: 'Mumbai' }
  }
});
await newDoctor.save();
```

#### 3. **Product.js**
Company product catalog with medical and business information.

**Key Fields:**
- `productId`: Auto-generated (PROD0001, PROD0002, etc.)
- `basicInfo`: Name, brand, category, description
- `medicalInfo`: Composition, dosage, strength, indications
- `businessInfo`: MRP, dealer price, margin
- `inventory`: Stock levels, batch numbers, expiry

**Usage:**
```javascript
const { Product } = require('./models');

const newProduct = new Product({
  basicInfo: {
    name: 'Cardio Plus',
    brandName: 'HealthCare',
    category: 'Cardiovascular'
  },
  medicalInfo: {
    strength: '500mg',
    dosageForm: 'Tablet'
  },
  businessInfo: {
    mrp: 150,
    dealerPrice: 120
  }
});
await newProduct.save();
```

#### 4. **VisitReport.js**
Detailed visit reports with doctor interactions and orders.

**Key Fields:**
- `visitId`: Auto-generated (VIS000001, VIS000002, etc.)
- `mr`: Reference to User (MR)
- `doctor`: Reference to Doctor
- `visitDetails`: Date, time, location, type
- `interaction`: Products discussed, notes, outcome
- `orders`: Array of products ordered during visit

**Usage:**
```javascript
const { VisitReport } = require('./models');

const newVisit = new VisitReport({
  mr: mrId,
  doctor: doctorId,
  visitDetails: {
    visitDate: new Date(),
    visitType: 'Scheduled'
  },
  interaction: {
    notes: 'Productive discussion',
    visitOutcome: 'Positive',
    productsDiscussed: [{
      product: productId,
      samplesGiven: 5,
      interestLevel: 'High'
    }]
  }
});
await newVisit.save();
```

#### 5. **Order.js**
Order management with financial calculations and status tracking.

**Key Fields:**
- `orderId`: Auto-generated (ORD000001, ORD000002, etc.)
- `mr`: Reference to User (MR)
- `doctor`: Reference to Doctor
- `items`: Array of products with quantities and prices
- `financial`: Auto-calculated totals, discounts, taxes
- `status`: Order lifecycle tracking

**Usage:**
```javascript
const { Order } = require('./models');

const newOrder = new Order({
  mr: mrId,
  doctor: doctorId,
  items: [{
    product: productId,
    quantity: 10,
    unitPrice: 100,
    discount: 10,
    taxRate: 18
  }]
});
await newOrder.save();
// financial.grandTotal is auto-calculated
```

### Performance & Analytics Models

#### 6. **MRTarget.js**
Monthly MR targets for performance tracking.

**Key Fields:**
- `mr`: Reference to User (MR)
- `month`, `year`: Target period
- `target_visits`: Number of visits expected
- `target_sales`: Sales amount expected
- `target_new_doctors`: New doctors to be added

**Unique Index:** `(mr, month, year)` - One target per MR per month

**Usage:**
```javascript
const { MRTarget } = require('./models');

const target = new MRTarget({
  mr: mrId,
  month: 11,
  year: 2024,
  target_visits: 50,
  target_sales: 100000,
  target_new_doctors: 10
});
await target.save();
```

#### 7. **MRPerformanceLog.js**
Monthly MR performance summaries with auto-calculated metrics.

**Key Fields:**
- `mr`: Reference to User (MR)
- `month`, `year`: Performance period
- `total_visits`, `total_orders`, `total_sale_amount`: Actual achievements
- `average_visits_per_day`: Auto-calculated
- `target_achievement_percentage`: Performance indicator

**Unique Index:** `(mr, month, year)` - One log per MR per month

**Usage:**
```javascript
const { MRPerformanceLog } = require('./models');

const performance = new MRPerformanceLog({
  mr: mrId,
  month: 11,
  year: 2024,
  total_visits: 45,
  total_orders: 30,
  total_sale_amount: 95000,
  working_days: 22
});
await performance.save();
// average_visits_per_day is auto-calculated
```

#### 8. **ProductActivityLog.js**
Tracks product discussions and activities for analytics.

**Key Fields:**
- `product`: Reference to Product
- `mr`: Reference to User (MR)
- `doctor`: Reference to Doctor
- `activity_type`: Discussion, Sample Given, Order Placed, etc.
- `interest_level`: High, Medium, Low
- `outcome`: Positive, Neutral, Negative

**Indexes:** Optimized for querying by product, MR, doctor, and date

**Usage:**
```javascript
const { ProductActivityLog } = require('./models');

const activity = new ProductActivityLog({
  product: productId,
  mr: mrId,
  doctor: doctorId,
  activity_type: 'Discussion',
  interest_level: 'High',
  outcome: 'Positive',
  notes: 'Doctor interested in product'
});
await activity.save();
```

## Relationships

```
User (MR)
  ├── VisitReport (many)
  ├── Order (many)
  ├── MRTarget (many)
  ├── MRPerformanceLog (many)
  └── ProductActivityLog (many)

Doctor
  ├── VisitReport (many)
  ├── Order (many)
  └── ProductActivityLog (many)

Product
  ├── Order.items (many)
  ├── VisitReport.interaction.productsDiscussed (many)
  └── ProductActivityLog (many)

VisitReport
  └── Order (one-to-many)
```

## Auto-Generated IDs

The following models have auto-generated IDs:
- **User**: `employeeId` (EMP0001, EMP0002, ...)
- **Doctor**: `doctorId` (DOC0001, DOC0002, ...)
- **Product**: `productId` (PROD0001, PROD0002, ...)
- **VisitReport**: `visitId` (VIS000001, VIS000002, ...)
- **Order**: `orderId` (ORD000001, ORD000002, ...)

## Testing

Run the test script to verify all models:

```bash
node server/test-models.js
```

This will:
1. Connect to MongoDB
2. Create sample data for each model
3. Verify relationships work correctly
4. Display summary of created records

## Import Usage

### Individual Import
```javascript
const User = require('./models/User');
const Doctor = require('./models/Doctor');
```

### Centralized Import (Recommended)
```javascript
const {
  User,
  Doctor,
  Product,
  VisitReport,
  Order,
  MRTarget,
  MRPerformanceLog,
  ProductActivityLog
} = require('./models');
```

## Best Practices

1. **Always use references**: Use ObjectId references instead of embedding large documents
2. **Populate when needed**: Use `.populate()` to load referenced documents
3. **Index frequently queried fields**: Models already have indexes on common query fields
4. **Use virtuals for computed fields**: Access computed properties without storing them
5. **Validate before save**: Models have built-in validation rules

## Example Queries

### Get MR with populated data
```javascript
const mr = await User.findById(mrId)
  .populate('workInfo.reportingManager')
  .exec();
```

### Get visits with doctor and products
```javascript
const visits = await VisitReport.find({ mr: mrId })
  .populate('doctor')
  .populate('interaction.productsDiscussed.product')
  .sort({ 'visitDetails.visitDate': -1 })
  .exec();
```

### Get monthly performance with target comparison
```javascript
const performance = await MRPerformanceLog.findOne({ 
  mr: mrId, 
  month: 11, 
  year: 2024 
});

const target = await MRTarget.findOne({ 
  mr: mrId, 
  month: 11, 
  year: 2024 
});

const achievement = (performance.total_visits / target.target_visits) * 100;
```

## Notes

- All models use timestamps (createdAt, updatedAt)
- Soft delete is not implemented - use `isActive` flags where needed
- Ensure MongoDB connection before using models
- Use transactions for operations affecting multiple collections
