const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: '' },
    image: {
      public_id: String,
      url: { type: String, default: '' },
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'kids', 'unisex'],
      default: 'unisex',
    },
    type: {
      type: String,
      enum: ['clothes', 'shoes', 'accessories'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
