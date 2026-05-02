const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingInfo: {
      fullName: { type: String, required: true },
      email:    { type: String, required: true },
      phone:    { type: String, required: true },
      city:     { type: String, required: true },
      address:  { type: String, required: true },
      notes:    { type: String, default: '' },
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cod'],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveredAt: Date,
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Generate a short order ID for display
orderSchema.virtual('shortId').get(function () {
  return this._id.toString().slice(-8).toUpperCase();
});

module.exports = mongoose.model('Order', orderSchema);
