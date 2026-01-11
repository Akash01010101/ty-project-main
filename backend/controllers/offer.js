const Offer = require('../models/Offer');
const Order = require('../models/Order');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const createOffer = async (req, res) => {
  try {
    const { toUser, gig, amount, description, duration } = req.body;
    const fromUser = req.user.userId;

    // Create the offer
    const offer = new Offer({
      fromUser,
      toUser,
      gig,
      amount,
      description,
      duration,
    });
    await offer.save();

    // Find or create a conversation between the two users
    let conversation = await Conversation.findOneAndUpdate(
      { participants: { $all: [fromUser, toUser] } },
      { $set: { participants: [fromUser, toUser] } },
      { upsert: true, new: true }
    );

    // Create a message for the offer
    const message = new Message({
      conversationId: conversation._id,
      sender: fromUser,
      type: 'offer',
      offer: offer._id,
    });
    await message.save();
    
    // Update the last message of the conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name profilePicture').populate('offer');

    res.status(201).json({ offer, message: populatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const updateOfferStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }

    if (status === 'accepted') {
      if (offer.toUser.toString() !== req.user.userId.toString()) {
        return res.status(401).json({ msg: 'User not authorized to accept this offer' });
      }

      const order = new Order({
        title: `Custom Offer: ${offer.description.substring(0, 20)}...`,
        description: offer.description,
        duration: offer.duration,
        price: offer.amount,
        buyer: offer.fromUser,
        seller: offer.toUser,
        gig: offer.gig,
      });
      await order.save();
      
      offer.status = 'accepted';
      offer.order = order._id;
      await offer.save();

      return res.json({ offer, order });

    } else if (status === 'declined') {
      if (offer.toUser.toString() !== req.user.userId.toString()) {
        return res.status(401).json({ msg: 'User not authorized to decline this offer' });
      }
      offer.status = 'declined';
      await offer.save();
      return res.json({ offer });

    } else if (status === 'cancelled') {
      const isSender = offer.fromUser.toString() === req.user.userId.toString();
      const isRecipient = offer.toUser.toString() === req.user.userId.toString();

      if (!isSender && !isRecipient) {
        return res.status(401).json({ msg: 'User not authorized to cancel this offer' });
      }

      if (offer.status === 'accepted') {
        if (offer.order) {
          const order = await Order.findById(offer.order);
          if (order) {
            if (order.status === 'pending') {
              await Order.findByIdAndDelete(offer.order);
              offer.order = undefined;
            } else {
              return res.status(400).json({ msg: 'Cannot cancel offer with active/completed order' });
            }
          }
        }
      } else if (offer.status === 'pending') {
        if (!isSender) {
          return res.status(401).json({ msg: 'User not authorized to cancel this offer' });
        }
      }

      offer.status = 'cancelled';
      await offer.save();
      return res.json({ offer });

    } else {
      return res.status(400).json({ msg: 'Invalid status' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({
      $or: [{ fromUser: req.user.userId }, { toUser: req.user.userId }],
    })
      .populate('fromUser', 'name profilePicture')
      .populate('toUser', 'name profilePicture')
      .populate('gig', 'title');
      
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createOffer,
  updateOfferStatus,
  getOffers,
};
