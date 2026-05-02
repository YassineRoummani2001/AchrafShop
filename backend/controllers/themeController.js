const asyncHandler = require('express-async-handler');
const Theme = require('../models/Theme');

/**
 * @desc    Get all themes
 * @route   GET /api/themes
 * @access  Public
 */
const getThemes = asyncHandler(async (req, res) => {
  const themes = await Theme.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: themes });
});

/**
 * @desc    Get active theme
 * @route   GET /api/themes/active
 * @access  Public
 */
const getActiveTheme = asyncHandler(async (req, res) => {
  // First check if there's a theme scheduled for today
  const today = new Date();
  const scheduledTheme = await Theme.findOne({
    startDate: { $lte: today },
    endDate: { $gte: today }
  });

  if (scheduledTheme) {
    return res.json({ success: true, data: scheduledTheme });
  }

  // Otherwise, get the manually active theme
  const activeTheme = await Theme.findOne({ isActive: true });
  
  if (activeTheme) {
    res.json({ success: true, data: activeTheme });
  } else {
    // Return a default theme structure if none is active
    res.json({ 
      success: true, 
      data: {
        name: 'default',
        primaryColor: '#1e293b',
        secondaryColor: '#c9a96e',
        backgroundColor: '#ffffff',
        fontStyle: 'Inter, sans-serif'
      } 
    });
  }
});

/**
 * @desc    Create a theme
 * @route   POST /api/themes
 * @access  Admin
 */
const createTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.create(req.body);
  res.status(201).json({ success: true, data: theme });
});

/**
 * @desc    Update a theme
 * @route   PUT /api/themes/:id
 * @access  Admin
 */
const updateTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    res.status(404);
    throw new Error('Theme not found');
  }

  // If this theme is being set to active, deactivate others
  if (req.body.isActive === true) {
    await Theme.updateMany({ _id: { $ne: theme._id } }, { isActive: false });
  }

  const updatedTheme = await Theme.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: updatedTheme });
});

/**
 * @desc    Set active theme
 * @route   PATCH /api/themes/:id/activate
 * @access  Admin
 */
const activateTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    res.status(404);
    throw new Error('Theme not found');
  }

  await Theme.updateMany({}, { isActive: false });
  theme.isActive = true;
  await theme.save();

  res.json({ success: true, data: theme });
});

/**
 * @desc    Delete a theme
 * @route   DELETE /api/themes/:id
 * @access  Admin
 */
const deleteTheme = asyncHandler(async (req, res) => {
  const theme = await Theme.findById(req.params.id);

  if (!theme) {
    res.status(404);
    throw new Error('Theme not found');
  }

  await theme.deleteOne();
  res.json({ success: true, message: 'Theme deleted successfully' });
});

module.exports = {
  getThemes,
  getActiveTheme,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
};
