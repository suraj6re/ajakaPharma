const express = require('express');
const router = express.Router();

// Legacy routes for backward compatibility
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Product = require('../models/Product');
const VisitReport = require('../models/VisitReport');
const { catchAsync } = require('../middleware/errorHandler');

// Legacy user routes
router.post('/users', catchAsync(async (req, res) => {
  const { firebaseUid, name, employeeId, email, role, region, phone, city, hq } = req.body;

  let user = await User.findOne({ firebaseUid });
  if (user) return res.status(400).json({ msg: 'User already exists' });

  user = new User({
    firebaseUid,
    personalInfo: { name, email, phone },
    employeeId,
    workInfo: { role, region, city, hq }
  });
  
  await user.save();
  res.status(201).json(user);
}));

router.get('/users', catchAsync(async (req, res) => {
  const { role } = req.query;
  const query = role ? { 'workInfo.role': role } : {};
  const users = await User.find(query);
  res.json(users);
}));

router.get('/users/by-uid/:uid', catchAsync(async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.params.uid });
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
}));

// Legacy doctor routes
router.get('/doctors', catchAsync(async (req, res) => {
  const doctors = await Doctor.find({ isActive: true });
  res.json(doctors);
}));

router.post('/doctors', catchAsync(async (req, res) => {
  const doctor = new Doctor(req.body);
  await doctor.save();
  res.status(201).json(doctor);
}));

router.put('/doctors/:id', catchAsync(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
  res.json(doctor);
}));

router.delete('/doctors/:id', catchAsync(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });
  res.json({ msg: 'Doctor deleted' });
}));

// Legacy product routes
router.get('/products', catchAsync(async (req, res) => {
  const products = await Product.find({ isActive: true });
  res.json(products);
}));

router.post('/products', catchAsync(async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
}));

router.put('/products/:id', catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ msg: 'Product not found' });
  res.json(product);
}));

router.delete('/products/:id', catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return res.status(404).json({ msg: 'Product not found' });
  res.json({ msg: 'Product deleted' });
}));

// Legacy visit report routes
router.post('/reports', catchAsync(async (req, res) => {
  const report = new VisitReport(req.body);
  await report.save();
  res.status(201).json(report);
}));

router.get('/reports', catchAsync(async (req, res) => {
  const reports = await VisitReport.find()
    .populate('mr', 'personalInfo.name employeeId')
    .populate('doctor', 'personalInfo.name contactInfo.address.city')
    .populate('interaction.productsDiscussed.product', 'basicInfo.name')
    .sort({ createdAt: -1 });
  res.json(reports);
}));

router.get('/reports/mr/:mrId', catchAsync(async (req, res) => {
  const reports = await VisitReport.find({ mr: req.params.mrId })
    .populate('doctor', 'personalInfo.name contactInfo.address.city')
    .populate('interaction.productsDiscussed.product', 'basicInfo.name')
    .sort({ createdAt: -1 });
  res.json(reports);
}));

// Legacy admin routes
router.get('/admin/dashboard', catchAsync(async (req, res) => {
  const [totalDoctors, totalProducts, totalVisits, totalOrders] = await Promise.all([
    Doctor.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true }),
    VisitReport.countDocuments(),
    VisitReport.aggregate([
      { $unwind: '$orders' },
      { $count: 'totalOrders' }
    ])
  ]);

  const chartData = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'visitreports',
        localField: '_id',
        foreignField: 'orders.product',
        as: 'orders'
      }
    },
    {
      $project: {
        name: '$basicInfo.name',
        orders: { $size: '$orders' }
      }
    },
    { $limit: 10 }
  ]);

  res.json({
    kpis: {
      totalDoctors,
      totalProducts,
      totalVisits,
      totalOrders: totalOrders[0]?.totalOrders || 0
    },
    chartData
  });
}));

router.get('/admin/mr-performance', catchAsync(async (req, res) => {
  const mrPerformance = await User.aggregate([
    { $match: { 'workInfo.role': 'MR', isActive: true } },
    {
      $lookup: {
        from: 'visitreports',
        localField: '_id',
        foreignField: 'mr',
        as: 'visits'
      }
    },
    {
      $project: {
        id: '$_id',
        name: '$personalInfo.name',
        visits: { $size: '$visits' },
        orders: {
          $size: {
            $reduce: {
              input: '$visits',
              initialValue: [],
              in: { $concatArrays: ['$$value', '$$this.orders'] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        performance: {
          $multiply: [
            { $divide: [{ $add: ['$visits', '$orders'] }, 20] },
            100
          ]
        }
      }
    }
  ]);

  res.json(mrPerformance);
}));

// Legacy admin MR management
router.post('/admin/mrs', catchAsync(async (req, res) => {
  const { name, email, employeeId, region, phone, city, hq } = req.body;
  const existing = await User.findOne({ 'personalInfo.email': email });
  if (existing) return res.status(400).json({ msg: 'User with this email already exists' });

  const mr = new User({
    personalInfo: { name, email, phone },
    employeeId,
    workInfo: { role: 'MR', region, city, hq },
    firebaseUid: `legacy-${Date.now()}`
  });
  await mr.save();
  res.status(201).json(mr);
}));

router.put('/admin/mrs/:id', catchAsync(async (req, res) => {
  const { name, email, employeeId, region, phone, city, hq } = req.body;
  const mr = await User.findByIdAndUpdate(
    req.params.id,
    {
      'personalInfo.name': name,
      'personalInfo.email': email,
      'personalInfo.phone': phone,
      employeeId,
      'workInfo.region': region,
      'workInfo.city': city,
      'workInfo.hq': hq
    },
    { new: true }
  );
  if (!mr) return res.status(404).json({ msg: 'MR not found' });
  res.json(mr);
}));

router.delete('/admin/mrs/:id', catchAsync(async (req, res) => {
  const mr = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!mr) return res.status(404).json({ msg: 'MR not found' });
  res.json({ msg: 'MR deleted' });
}));

module.exports = router;