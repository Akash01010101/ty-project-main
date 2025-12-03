const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: 'rzp_test_Rmf6SEALUezF1v',
  key_secret: '20bIh7hxYde1pZzXvdi3GzOA',
});

const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    const options = {
      amount: order.price * 100, // amount in the smallest currency unit
      currency: 'INR',
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json(razorpayOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', '20bIh7hxYde1pZzXvdi3GzOA')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      const order = await Order.findOne({ 'receipt': razorpay_order_id });
      if(order) {
        order.status = 'in-progress';
        await order.save();
        
        // TODO: Add money to freelancer's wallet
      }

      res.json({ status: 'success' });
    } else {
      res.status(400).json({ status: 'failure' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
