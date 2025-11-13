const { Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, isActive } = req.query;
  
  const query = {};
  
  if (category) {
    query['basicInfo.category'] = { $regex: category, $options: 'i' };
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (search) {
    query.$or = [
      { 'basicInfo.name': { $regex: search, $options: 'i' } },
      { 'basicInfo.brandName': { $regex: search, $options: 'i' } },
      { productId: { $regex: search, $options: 'i' } }
    ];
  }
  
  const products = await Product.find(query)
    .select('-__v')
    .sort({ createdAt: -1 });
  
  ApiResponse.success(res, 'Products retrieved successfully', {
    count: products.length,
    products
  });
});

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('-__v');
  
  if (!product) {
    return ApiResponse.notFound(res, 'Product not found');
  }
  
  ApiResponse.success(res, 'Product retrieved successfully', product);
});

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const { basicInfo, medicalInfo, businessInfo, inventory, regulatory } = req.body;
  
  // Check if product already exists
  const existingProduct = await Product.findOne({
    'basicInfo.name': basicInfo.name
  });
  
  if (existingProduct) {
    return ApiResponse.badRequest(res, 'Product with this name already exists');
  }
  
  const product = await Product.create({
    basicInfo,
    medicalInfo,
    businessInfo,
    inventory,
    regulatory
  });
  
  ApiResponse.created(res, 'Product created successfully', product);
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return ApiResponse.notFound(res, 'Product not found');
  }
  
  const { basicInfo, medicalInfo, businessInfo, inventory, regulatory, isActive, isDiscontinued } = req.body;
  
  if (basicInfo) Object.assign(product.basicInfo, basicInfo);
  if (medicalInfo) Object.assign(product.medicalInfo, medicalInfo);
  if (businessInfo) Object.assign(product.businessInfo, businessInfo);
  if (inventory) Object.assign(product.inventory, inventory);
  if (regulatory) Object.assign(product.regulatory, regulatory);
  if (isActive !== undefined) product.isActive = isActive;
  if (isDiscontinued !== undefined) product.isDiscontinued = isDiscontinued;
  
  await product.save();
  
  ApiResponse.success(res, 'Product updated successfully', product);
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return ApiResponse.notFound(res, 'Product not found');
  }
  
  product.isActive = false;
  product.isDiscontinued = true;
  await product.save();
  
  ApiResponse.success(res, 'Product discontinued successfully');
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
