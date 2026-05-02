const express = require('express');
const router = express.Router();
const {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} = require('../controllers/heroController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getHeroSlides)
  .post(protect, admin, createHeroSlide);

router.route('/:id')
  .put(protect, admin, updateHeroSlide)
  .delete(protect, admin, deleteHeroSlide);

module.exports = router;
