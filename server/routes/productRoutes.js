const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllProducts);
router.get('/:id', isAdminOrMR, getProductById);
router.post('/', isAdmin, createProduct);
router.put('/:id', isAdmin, updateProduct);
router.delete('/:id', isAdmin, deleteProduct);

module.exports = router;
