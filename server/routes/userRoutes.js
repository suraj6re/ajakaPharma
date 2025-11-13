const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  loginUser,
  getAllUsers,
  getUserById,
  getMyProfile,
  createUser,
  updateUser,
  deleteUser,
  getMRsByManager
} = require('../controllers/usersController');

// Public routes
router.post('/login', loginUser);

// Protected routes
router.use(authMiddleware); // All routes below require authentication

router.get('/me', getMyProfile);
router.get('/manager/:managerId/mrs', isAdminOrMR, getMRsByManager);
router.get('/', isAdmin, getAllUsers);
router.get('/:id', isAdminOrMR, getUserById);
router.post('/', isAdmin, createUser);
router.put('/:id', isAdminOrMR, updateUser);
router.delete('/:id', isAdmin, deleteUser);

module.exports = router;
