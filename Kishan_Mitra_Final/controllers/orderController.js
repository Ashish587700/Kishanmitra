const Order = require('../models/Order');

exports.placeOrder = async (req, res) => {
  try {
    const {
      buyerId,
      farmerId,
      items,
      totalAmount,
      deliveryAddress
    } = req.body;

    const newOrder = new Order({
      buyerId,
      farmerId,
      items,
      totalAmount,
      deliveryAddress
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email')  // optional: populate buyer/farmer info
      .populate('farmerId', 'name email');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
