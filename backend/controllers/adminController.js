const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

/**
 * @desc    Get user by ID (Admin)
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/admin/users/:id
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, data: user });
});

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin user'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

/**
 * @desc    Get dashboard statistics (Admin)
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    ordersByStatus,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    // Monthly revenue for last 6 months
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
    },
  });
});

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats };
