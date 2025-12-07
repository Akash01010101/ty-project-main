const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getSales = async (req, res) => {
  const user = req.user.userId;

  try {
    const orders = await Order.find({ seller: user })
      .populate('gig', 'title price')
      .populate('buyer', 'name')
      .populate('seller', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getOrders = async (req, res) => {
  const user = req.user.userId;

  try {
    const orders = await Order.find({ buyer: user })
      .populate('gig', 'title price')
      .populate('buyer', 'name')
      .populate('seller', 'name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createOrder = async (req, res) => {
  const { gigId, sellerId, price } = req.body;
  const buyer = req.user.userId;

  try {
    const order = new Order({
      gig: gigId,
      buyer,
      seller: sellerId,
      price,
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const completeBySeller = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.seller.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    order.status = 'completed-by-seller';
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error completing order by seller:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const Review = require('../models/Review');

// ... (getSales, getOrders, createOrder, completeBySeller)

const clearPayment = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.status !== 'completed-by-seller') {
      return res.status(400).json({ message: 'Order not yet marked as complete by seller' });
    }
    
    // Create review
    const review = new Review({
      fromUser: req.user.userId,
      toUser: order.seller,
      order: order._id,
      rating,
      comment,
    });
    await review.save();

    // Update seller's rating
    const seller = await User.findById(order.seller);
    const reviews = await Review.find({ toUser: order.seller });
    const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
    seller.rating = totalRating / reviews.length;
    
    // Clear payment
    order.status = 'completed';
    await order.save();

    seller.walletBalance += order.price;
    await seller.save();

    const transaction = new Transaction({
      user: order.seller,
      type: 'income',
      amount: order.price,
      description: `Payment for order: ${order.title}`,
      order: order._id,
    });
    await transaction.save();

    res.json({ message: 'Payment cleared, review submitted, and order completed', order });
  } catch (error) {
    console.error('Error clearing payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOrders,
  createOrder,
  getSales,
  completeBySeller,
  clearPayment,
};
