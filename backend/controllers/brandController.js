const asyncHandler = require('express-async-handler');
const Brand = require('../models/Brand');

/** GET /api/brands — public */
const getBrands = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  const brands = await Brand.find(filter).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: brands });
});

/** POST /api/brands — admin */
const createBrand = asyncHandler(async (req, res) => {
  const { name, logo, website, active, order } = req.body;
  if (!name) { res.status(400); throw new Error('Brand name is required'); }
  const brand = await Brand.create({ name, logo, website, active, order });
  res.status(201).json({ success: true, data: brand });
});

/** PUT /api/brands/:id — admin */
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  res.json({ success: true, data: brand });
});

/** DELETE /api/brands/:id — admin */
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) { res.status(404); throw new Error('Brand not found'); }
  res.json({ success: true, message: 'Brand deleted' });
});

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
