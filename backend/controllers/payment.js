/**
 * Payment Controller
 * 
 * Handles Razorpay payment integration.
 * SECURITY: API keys are loaded from environment variables, never hardcoded.
 * 
 * @module controllers/payment
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ============================================================================
// SECURITY: Load Razorpay credentials from environment variables
// Never hardcode API keys in source code!
// ============================================================================

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Validate that credentials are configured
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('SECURITY WARNING: Razorpay credentials not configured in environment variables!');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || '',
  key_secret: RAZORPAY_KEY_SECRET || '',
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
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    
    res.json(razorpayOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const verifyPayment = async (req, res) => {
  try {
    // SECURITY: Validate Razorpay credentials are configured
    if (!RAZORPAY_KEY_SECRET) {
      console.error('Payment verification failed: RAZORPAY_KEY_SECRET not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service configuration error' 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    // SECURITY: Use environment variable for signature verification
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if(order) {
        order.status = 'in-progress';
        await order.save();
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
