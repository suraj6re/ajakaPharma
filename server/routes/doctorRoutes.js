const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { isAdmin, isAdminOrMR } = require('../middleware/roleMiddleware');
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  assignMRToDoctor,
  removeMRFromDoctor
} = require('../controllers/doctorsController');

router.use(authMiddleware);

router.get('/', isAdminOrMR, getAllDoctors);
router.get('/:id', isAdminOrMR, getDoctorById);
router.post('/', isAdminOrMR, createDoctor);
router.put('/:id', isAdminOrMR, updateDoctor);
router.delete('/:id', isAdmin, deleteDoctor);
router.post('/:id/assign-mr', isAdmin, assignMRToDoctor);
router.delete('/:id/remove-mr/:mrId', isAdmin, removeMRFromDoctor);

module.exports = router;
