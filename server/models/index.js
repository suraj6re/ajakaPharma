// Central export file for all models
// Makes it easier to import models in controllers and routes

const User = require('./User');
const Doctor = require('./Doctor');
const Product = require('./Product');
const VisitReport = require('./VisitReport');
const Order = require('./Order');
const MRTarget = require('./MRTarget');
const MRPerformanceLog = require('./MRPerformanceLog');
const ProductActivityLog = require('./ProductActivityLog');
const MRRequest = require('./MRRequest');

module.exports = {
  User,
  Doctor,
  Product,
  VisitReport,
  Order,
  MRTarget,
  MRPerformanceLog,
  ProductActivityLog,
  MRRequest
};
