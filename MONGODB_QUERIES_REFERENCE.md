# MongoDB Queries Used in MR Reporting System

This document contains all MongoDB queries used across the project, organized by collection and operation type.

---

## 1. USER COLLECTION QUERIES

### 1.1 Authentication & Login
```javascript
// Find user by email for login
User.findOne({ email, isActive: true })

// Update last login timestamp
user.lastLogin = new Date();
await user.save();
```

### 1.2 User Management (CRUD)
```javascript
// Get all users with filters
User.find({
  role: 'MR',
  territory: 'Mumbai',
  isActive: true,
  $or: [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { employeeId: { $regex: search, $options: 'i' } }
  ]
})
.populate('reportingManager', 'name employeeId')
.select('-password -__v')
.sort({ createdAt: -1 })

// Get user by ID
User.findById(userId)
  .populate('reportingManager', 'name employeeId role')
  .select('-password -__v')

// Check if user exists (duplicate check)
User.findOne({
  $or: [
    { email: 'test@example.com' },
    { employeeId: 'MR001' }
  ]
})

// Create new user
User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: hashedPassword,
  role: 'MR',
  employeeId: 'MR001',
  phone: '+91 98765 43210',
  territory: 'Mumbai',
  region: 'West',
  city: 'Mumbai',
  reportingManager: managerId
})

// Update user
user.name = 'Updated Name';
user.isActive = true;
await user.save();

// Soft delete user
user.isActive = false;
await user.save();

// Get MRs under a manager
User.find({
  reportingManager: managerId,
  role: 'MR',
  isActive: true
}).select('-password')

// Count users by role
User.countDocuments({ role: 'MR' })
```

---

## 2. DOCTOR COLLECTION QUERIES

### 2.1 Doctor Listing & Search
```javascript
// Get all doctors with filters
Doctor.find({
  specialization: { $regex: 'Cardiology', $options: 'i' },
  place: { $regex: 'Mumbai', $options: 'i' },
  assignedMR: mrId,
  $or: [
    { name: { $regex: search, $options: 'i' } },
    { qualification: { $regex: search, $options: 'i' } },
    { place: { $regex: search, $options: 'i' } }
  ]
})
.populate('assignedMR', 'name employeeId')
.select('-__v')
.sort({ srNo: 1 })

// Get doctor by ID with populated fields
Doctor.findById(doctorId)
  .populate('assignedMRs', 'personalInfo.name employeeId workInfo.territory')
  .populate('preferences.preferredProducts', 'basicInfo.name productId')
  .select('-__v')
```

### 2.2 Doctor Management
```javascript
// Check if doctor exists (duplicate check)
Doctor.findOne({ phone: '+91 98765 43210' })

// Create new doctor
Doctor.create({
  name: 'Dr. Smith',
  qualification: 'MBBS, MD',
  place: 'Mumbai',
  specialization: 'Cardiology',
  phone: '+91 98765 43210',
  email: 'dr.smith@example.com',
  assignedMR: mrId
})

// Update doctor information
Object.assign(doctor.personalInfo, updatedPersonalInfo);
Object.assign(doctor.contactInfo.address, updatedAddress);
doctor.contactInfo.phone = newPhone;
await doctor.save();

// Soft delete doctor
doctor.isActive = false;
await doctor.save();

// Assign MR to doctor
doctor.assignedMRs.push(mrId);
await doctor.save();

// Remove MR from doctor
doctor.assignedMRs = doctor.assignedMRs.filter(mr => mr.toString() !== mrId);
await doctor.save();
```

---

## 3. PRODUCT COLLECTION QUERIES

### 3.1 Product Listing & Search
```javascript
// Get all products with filters
Product.find({
  'basicInfo.category': { $regex: 'Tablet', $options: 'i' },
  isActive: true,
  $or: [
    { 'basicInfo.name': { $regex: search, $options: 'i' } },
    { 'basicInfo.brandName': { $regex: search, $options: 'i' } },
    { productId: { $regex: search, $options: 'i' } }
  ]
})
.select('-__v')
.sort({ createdAt: -1 })

// Get product by ID
Product.findById(productId).select('-__v')
```

### 3.2 Product Management
```javascript
// Check if product exists
Product.findOne({ 'basicInfo.name': 'Aspirin' })

// Create new product
Product.create({
  basicInfo: {
    name: 'Aspirin',
    brandName: 'Disprin',
    category: 'Tablet'
  },
  medicalInfo: {
    composition: 'Acetylsalicylic Acid',
    indication: 'Pain relief'
  },
  businessInfo: {
    mrp: 50,
    ptr: 40
  }
})

// Update product
Object.assign(product.basicInfo, updatedBasicInfo);
Object.assign(product.medicalInfo, updatedMedicalInfo);
product.isActive = true;
await product.save();

// Soft delete product
product.isActive = false;
product.isDiscontinued = true;
await product.save();
```

---

## 4. VISIT REPORT COLLECTION QUERIES

### 4.1 Visit Report Listing
```javascript
// Get all visit reports with filters
VisitReport.find({
  mr: mrId,
  status: 'Approved',
  doctor: doctorId,
  'visitDetails.visitDate': {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
})
.populate('mr', 'name employeeId territory')
.populate('doctor', 'name place')
.populate('interaction.productsDiscussed.product', 'basicInfo.name productId')
.populate('orders.product', 'basicInfo.name productId')
.populate('approvedBy', 'name')
.select('-__v')
.sort({ 'visitDetails.visitDate': -1 })

// Get visit report by ID
VisitReport.findById(visitId)
  .populate('mr', 'name employeeId territory')
  .populate('doctor', 'name qualification place')
  .populate('interaction.productsDiscussed.product', 'basicInfo medicalInfo')
  .populate('orders.product', 'basicInfo businessInfo')
  .populate('approvedBy', 'name')
  .select('-__v')
```

### 4.2 Visit Report Management
```javascript
// Create visit report
VisitReport.create({
  mr: mrId,
  doctor: doctorId,
  visitDetails: {
    visitDate: new Date(),
    duration: 30,
    visitType: 'Scheduled'
  },
  interaction: {
    productsDiscussed: [
      {
        product: productId,
        samplesGiven: 5,
        interestLevel: 'High'
      }
    ],
    notes: 'Positive discussion',
    visitOutcome: 'Positive'
  },
  orders: [],
  status: 'Submitted'
})

// Update visit report
Object.assign(visit.visitDetails, updatedVisitDetails);
Object.assign(visit.interaction, updatedInteraction);
visit.orders = updatedOrders;
await visit.save();

// Approve visit report
visit.status = 'Approved';
visit.approvedBy = adminId;
visit.approvedAt = new Date();
await visit.save();

// Reject visit report
visit.status = 'Rejected';
visit.rejectionReason = 'Incomplete information';
await visit.save();

// Delete visit report
await visit.deleteOne();
```

---

## 5. ORDER COLLECTION QUERIES

### 5.1 Order Listing
```javascript
// Get all orders with filters
Order.find({
  mr: mrId,
  status: 'Pending',
  'orderDetails.orderType': 'Regular',
  'orderDetails.orderDate': {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
})
.populate('mr', 'name employeeId')
.populate('doctor', 'name')
.populate('items.product', 'name')
.populate('visitReport')
.sort({ createdAt: -1 })

// Get order by ID
Order.findById(orderId)
  .populate('mr', 'name email role')
  .populate('doctor', 'name email phone')
  .populate('items.product', 'name')
  .populate('visitReport')
```

### 5.2 Order Management
```javascript
// Create order
Order.create({
  mr: mrId,
  doctor: doctorId,
  visitReport: visitReportId,
  orderDetails: {
    orderDate: new Date(),
    orderType: 'Regular'
  },
  items: [
    {
      product: productId,
      quantity: 100,
      price: 50
    }
  ],
  delivery: {
    address: 'Hospital address',
    expectedDate: new Date()
  }
})

// Update order
Object.assign(order.orderDetails, updatedOrderDetails);
order.items = updatedItems;
order.status = 'Confirmed';
order.statusHistory.push({
  status: 'Confirmed',
  updatedBy: adminId,
  notes: 'Order confirmed'
});
await order.save();

// Delete order
await order.deleteOne();
```

---

## 6. MR TARGET COLLECTION QUERIES

### 6.1 Target Management
```javascript
// Get all targets with filters
MRTarget.find({
  mr: mrId,
  month: 11,
  year: 2024
})
.populate('mr', 'personalInfo.name employeeId workInfo.territory')
.populate('created_by', 'personalInfo.name')
.sort({ year: -1, month: -1 })

// Get target by ID
MRTarget.findById(targetId)
  .populate('mr', 'personalInfo workInfo')
  .populate('created_by', 'personalInfo.name')

// Check if target exists for period
MRTarget.findOne({
  mr: mrId,
  month: 11,
  year: 2024
})

// Create target
MRTarget.create({
  mr: mrId,
  month: 11,
  year: 2024,
  target_visits: 50,
  target_sales: 100000,
  target_new_doctors: 10,
  target_orders: 30,
  notes: 'Q4 targets',
  created_by: adminId
})

// Update target
target.target_visits = 60;
target.target_sales = 120000;
target.status = 'Active';
await target.save();

// Delete target
await target.deleteOne();
```

---

## 7. MR PERFORMANCE LOG COLLECTION QUERIES

### 7.1 Performance Tracking
```javascript
// Get all performance logs with filters
MRPerformanceLog.find({
  mr: mrId,
  month: 11,
  year: 2024,
  status: 'Verified'
})
.populate('mr', 'personalInfo.name employeeId workInfo.territory')
.populate('verified_by', 'personalInfo.name')
.sort({ year: -1, month: -1 })

// Get performance log by ID
MRPerformanceLog.findById(logId)
  .populate('mr', 'personalInfo workInfo')
  .populate('verified_by', 'personalInfo.name')

// Check if log exists for period
MRPerformanceLog.findOne({
  mr: mrId,
  month: 11,
  year: 2024
})

// Create performance log
MRPerformanceLog.create({
  mr: mrId,
  month: 11,
  year: 2024,
  actual_visits: 45,
  actual_sales: 95000,
  actual_new_doctors: 8,
  actual_orders: 28,
  achievement_percentage: 90
})

// Verify performance log
log.status = 'Verified';
log.verified_by = adminId;
log.verified_at = new Date();
await log.save();

// Delete performance log
await log.deleteOne();
```

---

## 8. PRODUCT ACTIVITY LOG COLLECTION QUERIES

### 8.1 Activity Tracking
```javascript
// Get all activities with filters
ProductActivityLog.find({
  product: productId,
  mr: mrId,
  doctor: doctorId,
  activity_type: 'Sample Given',
  date: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
})
.populate('product', 'basicInfo.name productId')
.populate('mr', 'personalInfo.name employeeId')
.populate('doctor', 'personalInfo.name doctorId')
.populate('visit_report', 'visitId')
.sort({ date: -1 })

// Get activity by ID
ProductActivityLog.findById(activityId)
  .populate('product', 'basicInfo medicalInfo')
  .populate('mr', 'personalInfo workInfo')
  .populate('doctor', 'personalInfo contactInfo')
  .populate('visit_report')
  .populate('order')

// Create activity log
ProductActivityLog.create({
  product: productId,
  mr: mrId,
  doctor: doctorId,
  activity_type: 'Sample Given',
  quantity: 5,
  doctor_feedback: 'Positive response',
  interest_level: 'High',
  outcome: 'Positive',
  notes: 'Doctor interested in product'
})

// Bulk insert activity logs
ProductActivityLog.insertMany([
  {
    product: productId1,
    mr: mrId,
    doctor: doctorId,
    activity_type: 'Discussion',
    date: new Date()
  },
  {
    product: productId2,
    mr: mrId,
    doctor: doctorId,
    activity_type: 'Sample Given',
    quantity: 3,
    date: new Date()
  }
])
```

### 8.2 Product Analytics (Aggregation)
```javascript
// Get product analytics using aggregation
ProductActivityLog.aggregate([
  {
    $match: {
      product: productId,
      date: {
        $gte: new Date('2024-01-01'),
        $lte: new Date('2024-12-31')
      }
    }
  },
  {
    $group: {
      _id: '$activity_type',
      count: { $sum: 1 },
      totalQuantity: { $sum: '$quantity' },
      uniqueDoctors: { $addToSet: '$doctor' },
      uniqueMRs: { $addToSet: '$mr' }
    }
  },
  {
    $project: {
      activity_type: '$_id',
      count: 1,
      totalQuantity: 1,
      uniqueDoctorsCount: { $size: '$uniqueDoctors' },
      uniqueMRsCount: { $size: '$uniqueMRs' }
    }
  }
])
```

---

## 9. MR REQUEST COLLECTION QUERIES

### 9.1 MR Application Management
```javascript
// Get all MR requests with filters
MRRequest.find({
  status: 'pending',
  email: { $regex: search, $options: 'i' }
})
.populate('processedBy', 'name email')
.populate('createdUserId', 'name email employeeId')
.sort({ createdAt: -1 })

// Get MR request by ID
MRRequest.findById(requestId)
  .populate('processedBy', 'name email')
  .populate('createdUserId', 'name email employeeId')

// Check if request exists (duplicate check)
MRRequest.findOne({
  email: 'applicant@example.com',
  status: 'pending'
})

// Create MR request
MRRequest.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 98765 43210',
  area: 'Mumbai',
  experience: '5 years in pharmaceutical sales'
})

// Approve MR request
request.status = 'approved';
request.processedBy = adminId;
request.processedAt = new Date();
request.tempPassword = 'TEMP123';
request.createdUserId = newUserId;
await request.save();

// Reject MR request
request.status = 'rejected';
request.processedBy = adminId;
request.processedAt = new Date();
request.rejectionReason = 'Insufficient experience';
await request.save();

// Delete MR request
await request.deleteOne();
```

---

## 10. COMMON QUERY PATTERNS

### 10.1 Text Search (Case-Insensitive)
```javascript
// Single field search
{ name: { $regex: searchTerm, $options: 'i' } }

// Multiple field search (OR condition)
{
  $or: [
    { name: { $regex: searchTerm, $options: 'i' } },
    { email: { $regex: searchTerm, $options: 'i' } },
    { employeeId: { $regex: searchTerm, $options: 'i' } }
  ]
}
```

### 10.2 Date Range Queries
```javascript
// Date range filter
{
  createdAt: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31')
  }
}

// Nested date field
{
  'visitDetails.visitDate': {
    $gte: startDate,
    $lte: endDate
  }
}
```

### 10.3 Population (Joins)
```javascript
// Single population
.populate('mr', 'name employeeId')

// Multiple populations
.populate([
  { path: 'mr', select: 'name employeeId' },
  { path: 'doctor', select: 'name place' },
  { path: 'product', select: 'basicInfo.name' }
])

// Nested population
.populate({
  path: 'assignedMRs',
  select: 'personalInfo.name employeeId',
  populate: {
    path: 'reportingManager',
    select: 'name'
  }
})
```

### 10.4 Sorting
```javascript
// Ascending order
.sort({ createdAt: 1 })

// Descending order
.sort({ createdAt: -1 })

// Multiple fields
.sort({ year: -1, month: -1 })

// Nested field
.sort({ 'visitDetails.visitDate': -1 })
```

### 10.5 Field Selection
```javascript
// Exclude fields
.select('-password -__v')

// Include specific fields
.select('name email role')

// Exclude password from object
const userResponse = user.toObject();
delete userResponse.password;
```

### 10.6 Counting Documents
```javascript
// Count all documents
Model.countDocuments()

// Count with filter
User.countDocuments({ role: 'MR' })

// Count in query result
const users = await User.find(query);
const count = users.length;
```

---

## 11. ADVANCED AGGREGATION QUERIES

### 11.1 Group By and Count
```javascript
// Group by activity type
ProductActivityLog.aggregate([
  { $match: { product: productId } },
  {
    $group: {
      _id: '$activity_type',
      count: { $sum: 1 },
      totalQuantity: { $sum: '$quantity' }
    }
  }
])
```

### 11.2 Unique Values
```javascript
// Get unique doctors and MRs
{
  $group: {
    _id: '$activity_type',
    uniqueDoctors: { $addToSet: '$doctor' },
    uniqueMRs: { $addToSet: '$mr' }
  }
}

// Count unique values
{
  $project: {
    uniqueDoctorsCount: { $size: '$uniqueDoctors' }
  }
}
```

---

## 12. TRANSACTION EXAMPLES

### 12.1 Multi-Document Transaction
```javascript
// Example: Approve MR request with user creation
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Create user
  const newUser = await User.create([{
    name: request.name,
    email: request.email,
    password: hashedPassword,
    role: 'MR'
  }], { session });
  
  // Update request
  request.status = 'approved';
  request.createdUserId = newUser[0]._id;
  await request.save({ session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 13. INDEX RECOMMENDATIONS

```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ employeeId: 1 }, { unique: true })
db.users.createIndex({ role: 1, isActive: 1 })

// Doctor collection
db.doctors.createIndex({ phone: 1 })
db.doctors.createIndex({ assignedMR: 1 })
db.doctors.createIndex({ place: 1, specialization: 1 })

// Visit Report collection
db.visitreports.createIndex({ mr: 1, 'visitDetails.visitDate': -1 })
db.visitreports.createIndex({ doctor: 1 })
db.visitreports.createIndex({ status: 1 })

// Product Activity Log collection
db.productactivitylogs.createIndex({ product: 1, date: -1 })
db.productactivitylogs.createIndex({ mr: 1, date: -1 })
db.productactivitylogs.createIndex({ doctor: 1 })

// MR Request collection
db.mrrequests.createIndex({ email: 1, status: 1 })
db.mrrequests.createIndex({ status: 1, createdAt: -1 })
```

---

## SUMMARY

This document contains **100+ MongoDB queries** used across the MR Reporting System, including:

- **CRUD Operations**: Create, Read, Update, Delete
- **Search Queries**: Text search, regex patterns
- **Filtering**: Status, date ranges, role-based
- **Population**: Joining related documents
- **Aggregation**: Analytics and statistics
- **Sorting & Pagination**: Ordered results
- **Transactions**: Multi-document operations
- **Indexing**: Performance optimization

All queries follow MongoDB best practices and are optimized for performance.
