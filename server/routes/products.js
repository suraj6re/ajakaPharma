const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateProductCreation, validatePagination, validateObjectId } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// @route   GET /api/v1/products
// @desc    Get all products with filtering and pagination
// @access  Private
router.get('/', 
  authenticateToken,
  validatePagination,
  catchAsync(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      isActive = true,
      sortBy = 'basicInfo.name',
      sortOrder = 'asc'
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (category) {
      filter['basicInfo.category'] = new RegExp(category, 'i');
    }
    
    if (search) {
      filter.$or = [
        { 'basicInfo.name': new RegExp(search, 'i') },
        { 'basicInfo.brandName': new RegExp(search, 'i') },
        { 'basicInfo.genericName': new RegExp(search, 'i') },
        { 'medicalInfo.composition': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-__v')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });
  })
);

// @route   GET /api/v1/products/:id
// @desc    Get product by ID
// @access  Private
router.get('/:id', 
  authenticateToken,
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      data: { product }
    });
  })
);

// @route   POST /api/v1/products
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateProductCreation,
  catchAsync(async (req, res) => {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  })
);

// @route   PUT /api/v1/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  })
);

// @route   DELETE /api/v1/products/:id
// @desc    Deactivate product (Admin only)
// @access  Private/Admin
router.delete('/:id', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product deactivated successfully'
    });
  })
);

// @route   PUT /api/v1/products/:id/inventory
// @desc    Update product inventory (Admin only)
// @access  Private/Admin
router.put('/:id/inventory', 
  authenticateToken,
  authorizeRoles('Admin'),
  validateObjectId('id'),
  catchAsync(async (req, res) => {
    const { stockQuantity, reorderLevel, batchNumber, expiryDate } = req.body;
    
    const updateData = {};
    if (stockQuantity !== undefined) updateData['inventory.stockQuantity'] = stockQuantity;
    if (reorderLevel !== undefined) updateData['inventory.reorderLevel'] = reorderLevel;
    if (batchNumber) updateData['inventory.batchNumber'] = batchNumber;
    if (expiryDate) updateData['inventory.expiryDate'] = expiryDate;
    updateData['inventory.lastRestocked'] = new Date();

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({
      success: true,
      message: 'Product inventory updated successfully',
      data: { product }
    });
  })
);

// @route   GET /api/v1/products/categories/list
// @desc    Get list of all product categories
// @access  Private
router.get('/categories/list', 
  authenticateToken,
  catchAsync(async (req, res) => {
    const categories = await Product.distinct('basicInfo.category', { isActive: true });
    
    res.json({
      success: true,
      data: { categories: categories.filter(Boolean).sort() }
    });
  })
);

// @route   GET /api/v1/products/low-stock
// @desc    Get products with low stock (Admin only)
// @access  Private/Admin
router.get('/low-stock/list', 
  authenticateToken,
  authorizeRoles('Admin'),
  catchAsync(async (req, res) => {
    const products = await Product.find({
      isActive: true,
      $expr: {
        $lte: ['$inventory.stockQuantity', '$inventory.reorderLevel']
      }
    }).select('basicInfo.name inventory.stockQuantity inventory.reorderLevel');

    res.json({
      success: true,
      data: { products }
    });
  })
);

// @route   GET /api/v1/products/expiring-soon
// @desc    Get products expiring within 30 days (Admin only)
// @access  Private/Admin
router.get('/expiring-soon/list', 
  authenticateToken,
  authorizeRoles('Admin'),
  catchAsync(async (req, res) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const products = await Product.find({
      isActive: true,
      'inventory.expiryDate': {
        $lte: thirtyDaysFromNow,
        $gte: new Date()
      }
    }).select('basicInfo.name inventory.expiryDate inventory.batchNumber');

    res.json({
      success: true,
      data: { products }
    });
  })
);

// @route   POST /api/v1/products/bulk-import
// @desc    Bulk import products from CSV/JSON (Admin only)
// @access  Private/Admin
router.post('/bulk-import', 
  authenticateToken,
  authorizeRoles('Admin'),
  catchAsync(async (req, res) => {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      throw new AppError('Products array is required', 400);
    }

    const results = {
      success: [],
      errors: []
    };

    for (let i = 0; i < products.length; i++) {
      try {
        const product = new Product(products[i]);
        await product.save();
        results.success.push({
          index: i,
          productId: product.productId,
          name: product.basicInfo.name
        });
      } catch (error) {
        results.errors.push({
          index: i,
          error: error.message,
          data: products[i]
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed. ${results.success.length} products imported, ${results.errors.length} errors.`,
      data: results
    });
  })
);

module.exports = router;