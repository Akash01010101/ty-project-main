const Gig = require('../models/Gig');

const getGigs = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const query = userId ? { user: { $ne: userId } } : {}; // Exclude own gigs if user is logged in
    const gigs = await Gig.find(query).populate('user', 'name university profilePicture rating'); // Populate relevant user info
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createGig = async (req, res) => {
  const { title, description, price, duration, skills } = req.body;
  const user = req.user.userId;

  try {
    const gig = new Gig({
      title,
      description,
      price,
      duration,
      skills,
      user,
    });

    await gig.save();
    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMyGigs = async (req, res) => {
  const user = req.user.userId;

  try {
    const gigs = await Gig.find({ user });
    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getGigs,
  createGig,
  getMyGigs,
};
