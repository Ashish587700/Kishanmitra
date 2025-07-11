const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number },
  comment: { type: String }
});

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered'],
    default: 'processing'
  },
  feedback: feedbackSchema,
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('Order', orderSchema);
