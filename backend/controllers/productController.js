const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

/**
 * Build filter query from request query params
 */
const buildFilter = (query) => {
  const filter = { isActive: true };

  if (query.gender) filter.gender = query.gender;
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = new RegExp(query.brand, 'i');
  if (query.featured === 'true') filter.isFeatured = true;

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Text search
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  return filter;
};

/**
 * @desc    Get all products with filters, pagination, sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = buildFilter(req.query);

  // Sorting
  let sortBy = {};
  switch (req.query.sort) {
    case 'price_asc': sortBy = { price: 1 }; break;
    case 'price_desc': sortBy = { price: -1 }; break;
    case 'newest': sortBy = { createdAt: -1 }; break;
    case 'rating': sortBy = { rating: -1 }; break;
    case 'popular': sortBy = { numReviews: -1 }; break;
    default: sortBy = { createdAt: -1 };
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-reviews');

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body, seller: req.user._id };

  // Handle images (uploaded via Cloudinary or placeholder URLs)
  if (req.body.images) {
    productData.images = req.body.images;
  } else {
    productData.images = [{ url: 'https://placehold.co/600x800?text=Product' }];
  }

  const product = await Product.create(productData);
  await product.populate('category', 'name slug');

  res.status(201).json({ success: true, data: product });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = false;
  await product.save();

  res.json({ success: true, message: 'Product deleted successfully' });
});

/**
 * @desc    Add review to product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    // Update existing review
    alreadyReviewed.rating = rating;
    alreadyReviewed.comment = comment;
  } else {
    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  }

  product.calculateAverageRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review submitted successfully' });
});

/**
 * @desc    Update stock only
 * @route   PATCH /api/products/:id/stock
 * @access  Admin
 */
const updateStock = asyncHandler(async (req, res) => {
  const { stock, operation } = req.body; // operation: 'set' | 'add' | 'subtract'
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (operation === 'add') {
    product.stock = product.stock + Number(stock);
  } else if (operation === 'subtract') {
    product.stock = Math.max(0, product.stock - Number(stock));
  } else {
    product.stock = Number(stock);
  }

  await product.save();
  res.json({ success: true, data: { _id: product._id, stock: product.stock } });
});


const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .select('-reviews');

  res.json({ success: true, data: products });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getFeaturedProducts,
  updateStock,
};
