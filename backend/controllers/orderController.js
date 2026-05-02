const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingInfo, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Validate required shipping info
  if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.city || !shippingInfo.address) {
    res.status(400);
    throw new Error('Shipping information is incomplete');
  }

  // Validate stock availability
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.name} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    // Decrement stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingInfo,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    taxPrice: taxPrice || 0,
    totalPrice,
  });

  res.status(201).json({ success: true, data: order });
});

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'name images');

  res.json({ success: true, data: orders });
});

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure user can only access their own orders (unless admin)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'processing';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.payer?.email_address,
  };

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (orderStatus === 'delivered') order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  res.json({ success: true, data: updatedOrder });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  getAllOrders,
  updateOrderStatus,
};
