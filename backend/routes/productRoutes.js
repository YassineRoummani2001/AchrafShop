const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getFeaturedProducts, updateStock,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/admin/all', protect, admin, async (req, res) => {
  const Product = require('../models/Product');
  const products = await Product.find({})
    .populate('category', 'name')
    .select('name images stock price isActive isFeatured brand gender')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: products });
});
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.patch('/:id/stock', protect, admin, updateStock);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
