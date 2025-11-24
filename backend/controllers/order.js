const Order = require('../models/Order');
const Transaction = require('../models/Transaction'); // Import Transaction model

const getOrders = async (req, res) => {
  const user = req.user.userId;

  try {
    const orders = await Order.find({
      $or: [{ buyer: user }, { seller: user }]
    })
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

const approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('gig', 'title');

    if (!order) {
      console.log(`Order with ID ${orderId} not found.`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('User attempting to approve:', req.user.userId);
    console.log('Order seller:', order.seller.toString());
    console.log('Is user the seller?', order.seller.toString() === req.user.userId);

    // Ensure only the seller can approve the order
    if (order.seller.toString() !== req.user.userId) {
      console.log('403: User is not the seller for this order.');
      return res.status(403).json({ message: 'Not authorized to approve this order' });
    }

    order.status = 'in-progress'; // Or 'completed' if the gig is instant delivery
    await order.save();

    // Create a transaction for the seller (income)
    const transaction = new Transaction({
      user: order.seller,
      type: 'income',
      amount: order.price,
      description: `Income from gig: ${order.gig.title}`,
      order: order._id,
    });
    await transaction.save();

    console.log(`Order ${orderId} approved by user ${req.user.userId}.`);
    res.json({ message: 'Order approved and marked as in-progress', order });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('gig', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure only the seller can reject the order
    if (order.seller.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to reject this order' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order rejected and marked as cancelled', order });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOrders,
  createOrder,
  approveOrder,
  rejectOrder,
};
