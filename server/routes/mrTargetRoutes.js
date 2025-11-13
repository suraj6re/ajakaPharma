const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllTargets,
  getTargetById,
  createTarget,
  updateTarget,
  deleteTarget
} = require('../controllers/mrTargetController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllTargets);
router.get('/:id', isAdminOrMR, getTargetById);
router.post('/', isAdmin, createTarget);
router.put('/:id', isAdmin, updateTarget);
router.delete('/:id', isAdmin, deleteTarget);

module.exports = router;
