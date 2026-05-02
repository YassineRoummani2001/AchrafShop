const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
