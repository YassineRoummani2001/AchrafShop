const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  logo:     { type: String, default: '' },   // image URL
  website:  { type: String, default: '' },
  active:   { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
