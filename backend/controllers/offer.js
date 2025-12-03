const Offer = require('../models/Offer');
const Order = require('../models/Order');

const createOffer = async (req, res) => {
  try {
    const { toUser, gig, amount, description, duration } = req.body;
    const offer = new Offer({
      fromUser: req.user.userId,
      toUser,
      gig,
      amount,
      description,
      duration,
    });
    await offer.save();
    res.status(201).json(offer);
  } catch (error) => {
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
      if (offer.toUser.toString() !== req.user.userId) {
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
      await offer.save();

      return res.json({ offer, order });

    } else if (status === 'declined') {
      if (offer.toUser.toString() !== req.user.userId) {
        return res.status(401).json({ msg: 'User not authorized to decline this offer' });
      }
      offer.status = 'declined';
      await offer.save();
      return res.json({ offer });

    } else if (status === 'cancelled') {
      if (offer.fromUser.toString() !== req.user.userId) {
        return res.status(401).json({ msg: 'User not authorized to cancel this offer' });
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
