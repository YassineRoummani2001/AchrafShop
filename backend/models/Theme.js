const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a theme name'],
    unique: true,
  },
  primaryColor: {
    type: String,
    default: '#1e293b', // Default dark blue
  },
  secondaryColor: {
    type: String,
    default: '#c9a96e', // Default gold
  },
  backgroundColor: {
    type: String,
    default: '#ffffff', // Default white
  },
  bannerImage: {
    type: String,
    default: '',
  },
  fontStyle: {
    type: String,
    default: 'Inter, sans-serif',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  }
}, { timestamps: true });

// Ensure only one theme is active at a time if this one is set to active
themeSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { isActive: false });
  }
  next();
});

module.exports = mongoose.model('Theme', themeSchema);
