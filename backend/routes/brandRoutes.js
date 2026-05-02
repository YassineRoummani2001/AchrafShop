const express = require('express');
const router  = express.Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, admin } = require('../middleware/auth');

router.get('/',       getBrands);
router.post('/',      protect, admin, createBrand);
router.put('/:id',    protect, admin, updateBrand);
router.delete('/:id', protect, admin, deleteBrand);

module.exports = router;
