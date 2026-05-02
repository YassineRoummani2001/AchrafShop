const express = require('express');
const dotenv  = require('dotenv');
const path    = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ===== Security Middleware =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// ===== CORS =====
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ===== Body Parser =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Logger (dev only) =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== Static files — uploaded images =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== API Routes =====
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/products',   require('./routes/productRoutes'));
app.use('/api/orders',     require('./routes/orderRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/admin',      require('./routes/adminRoutes'));
app.use('/api/upload',     require('./routes/uploadRoutes'));
app.use('/api/brands',     require('./routes/brandRoutes'));
app.use('/api/hero',       require('./routes/heroRoutes'));
app.use('/api/themes',     require('./routes/themeRoutes'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AchrafShop API is running', timestamp: new Date().toISOString() });
});

// ── Public Stats Endpoint ───────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const User    = require('./models/User');
    const Brand   = require('./models/Brand');
    const Order   = require('./models/Order');

    const [totalProducts, totalUsers, totalBrands, ratingData, totalOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Brand.countDocuments({ active: true }),
      Product.aggregate([
        { $match: { numReviews: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]),
      Order.countDocuments(),
    ]);

    const avgRating = ratingData[0]?.avg || 4.9;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalUsers,
        totalBrands,
        totalOrders,
        avgRating: Math.round(avgRating * 10) / 10,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== Error Handling =====
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

module.exports = app;
