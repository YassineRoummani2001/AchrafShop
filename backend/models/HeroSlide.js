const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  subtitle: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: [true, 'Please add an image url'],
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  buttonLink: {
    type: String,
    default: '/products',
  },
  active: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
