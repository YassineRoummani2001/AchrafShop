const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.gender) filter.gender = req.query.gender;
  if (req.query.type) filter.type = req.query.type;

  const categories = await Category.find(filter).sort({ name: 1 });
  res.json({ success: true, data: categories });
});

/**
 * @desc    Create category
 * @route   POST /api/categories
 * @access  Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, data: category });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
