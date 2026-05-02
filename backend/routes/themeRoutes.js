const express = require('express');
const router = express.Router();
const {
  getThemes,
  getActiveTheme,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
} = require('../controllers/themeController');
const { protect, admin } = require('../middleware/auth');

router.route('/active').get(getActiveTheme);

router.route('/')
  .get(getThemes)
  .post(protect, admin, createTheme);

router.route('/:id/activate')
  .patch(protect, admin, activateTheme);

router.route('/:id')
  .put(protect, admin, updateTheme)
  .delete(protect, admin, deleteTheme);

module.exports = router;
