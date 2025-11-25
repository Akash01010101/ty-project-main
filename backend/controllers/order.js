const Order = require('../models/Order');
const Transaction = require('../models/Transaction'); // Import Transaction model

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

const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('gig', 'title');

    if (!order) {
      console.log(`Order with ID ${orderId} not found.`);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure only the seller can complete the order
    if (order.seller.toString() !== req.user.userId.toString()) {
      console.log('403: User is not the seller for this order.');
      return res.status(403).json({ message: 'Not authorized to complete this order' });
    }

    order.status = 'completed-by-seller';
    await order.save();

    console.log(`Order ${orderId} marked as completed by seller ${req.user.userId}.`);
    res.json({ message: 'Order marked as completed by seller', order });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const confirmCompletion = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('gig', 'title');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure only the buyer can confirm completion
    if (order.buyer.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm completion for this order' });
    }

    // Ensure the order was marked as completed by the seller
    if (order.status !== 'completed-by-seller') {
      return res.status(400).json({ message: 'Order not yet marked as completed by seller' });
    }

    order.status = 'completed';
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

    res.json({ message: 'Order completed and payment processed', order });
  } catch (error) {
    console.error('Error confirming order completion:', error);
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
    if (order.seller.toString() !== req.user.userId.toString()) {
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

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow both buyer and seller to delete a completed or cancelled order
    if (order.buyer.toString() !== req.user.userId.toString() && order.seller.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this order' });
    }

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only completed or cancelled orders can be deleted' });
    }

    await Order.findByIdAndDelete(orderId);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getOrders,
  createOrder,
  rejectOrder,
  getSales,
  completeOrder,
  confirmCompletion,
  deleteOrder,
};
