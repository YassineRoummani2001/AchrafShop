const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, changePassword, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const validateRegister = [
  body('name').notEmpty().trim().isLength({ max: 50 }).withMessage('Name is required (max 50 chars)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
