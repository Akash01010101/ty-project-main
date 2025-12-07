const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Offer = require('./models/Offer');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Deleting conversations...');
    await Conversation.deleteMany({});
    console.log('Deleting messages...');
    await Message.deleteMany({});
    console.log('Deleting offers...');
    await Offer.deleteMany({});
    console.log('Deleting orders...');
    await Order.deleteMany({});
    console.log('Deleting reviews...');
    await Review.deleteMany({});
    console.log('Deleting transactions...');
    await Transaction.deleteMany({});

    console.log('Updating users...');
    await User.updateMany({}, {
      $set: {
        following: [],
        followers: [],
        walletBalance: 0,
      }
    });

    console.log('Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
