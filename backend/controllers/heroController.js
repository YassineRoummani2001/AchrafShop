const asyncHandler = require('express-async-handler');
const HeroSlide = require('../models/HeroSlide');

/**
 * @desc    Get all hero slides
 * @route   GET /api/hero
 * @access  Public
 */
const getHeroSlides = asyncHandler(async (req, res) => {
  const query = req.query.all ? {} : { active: true };
  const slides = await HeroSlide.find(query).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: slides });
});

/**
 * @desc    Create a hero slide
 * @route   POST /api/hero
 * @access  Admin
 */
const createHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.create(req.body);
  res.status(201).json({ success: true, data: slide });
});

/**
 * @desc    Update a hero slide
 * @route   PUT /api/hero/:id
 * @access  Admin
 */
const updateHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!slide) {
    res.status(404);
    throw new Error('Slide not found');
  }

  res.json({ success: true, data: slide });
});

/**
 * @desc    Delete a hero slide
 * @route   DELETE /api/hero/:id
 * @access  Admin
 */
const deleteHeroSlide = asyncHandler(async (req, res) => {
  const slide = await HeroSlide.findById(req.params.id);

  if (!slide) {
    res.status(404);
    throw new Error('Slide not found');
  }

  await slide.deleteOne();
  res.json({ success: true, message: 'Slide deleted successfully' });
});

module.exports = {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
};
