const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Review = require('../models/Review');

// JWT Secret (in production, use a secure environment variable)
const JWT_SECRET = process.env.JWT_SECRET ;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  console.log('Incoming registration request - req.body:', req.body);
  console.log('Incoming registration request - req.files:', req.files);
  try {
    const { name, email, password, university, skills, experience, education } = req.body;
    
    // File paths for profile picture and resume
    let profilePicturePath = null;
    let resumePath = null;

    if (req.files && req.files['profilePicture']) {
      profilePicturePath = req.files['profilePicture'][0].path;
    }
    if (req.files && req.files['resume']) {
      resumePath = req.files['resume'][0].path;
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Parse experience and education (if provided as JSON strings)
    let parsedExperience = [];
    if (experience) {
      try {
        parsedExperience = JSON.parse(experience);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid experience data format' });
      }
    }

    let parsedEducation = [];
    if (education) {
      try {
        parsedEducation = JSON.parse(education);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid education data format' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      university: university || 'State University',
      skills: skills ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
      profilePicture: profilePicturePath,
      resume: resumePath,
      experience: parsedExperience,
      education: parsedEducation,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        error: 'Validation Error'
      });
    }
    
    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
        error: 'Duplicate Email'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, university, skills, experience, education } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (university) user.university = university;
    if (skills) user.skills = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Handle file uploads if they exist
    if (req.files && req.files['profilePicture']) {
      user.profilePicture = req.files['profilePicture'][0].path;
    }
    if (req.files && req.files['resume']) {
      user.resume = req.files['resume'][0].path;
    }

    // Parse and update experience and education (if provided as JSON strings)
    if (experience) {
      try {
        user.experience = JSON.parse(experience);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid experience data format' });
      }
    }
    if (education) {
      try {
        user.education = JSON.parse(education);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid education data format' });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};

const searchUsers = async (req, res) => {
  const { q } = req.query;

  try {
    const users = await User.find({
      name: { $regex: q || '', $options: 'i' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};



// @desc    Get quick stats for the dashboard
// @route   GET /api/auth/quick-stats
// @access  Private
const getQuickStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalGigs = await Gig.countDocuments({ user: userId });
    const activeOrders = await Order.countDocuments({ seller: userId, status: 'in-progress' });
    const portfolioItems = await Portfolio.countDocuments({ user: userId });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const monthlyTransactions = await Transaction.find({
      user: userId,
      type: 'income',
      createdAt: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    const thisMonth = monthlyTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Mocked data for now
    const rating = 4.8;
    const responseRate = 98;
    const profileStrength = 96;
    const marketDemand = 81;


    res.json({
      rating,
      totalGigs,
      activeOrders,
      portfolioItems,
      thisMonth,
      responseRate,
      profileStrength,
      marketDemand,
    });
  } catch (error) {
    console.error('Error getting quick stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    if (currentUser.following.includes(req.params.id)) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user.userId.toString()
      );
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'User unfollowed' });
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.userId);
      await currentUser.save();
      await userToFollow.save();
      res.json({ message: 'User followed' });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const gigs = await Gig.find({ user: req.params.id });
    const reviews = await Review.find({ toUser: req.params.id }).populate('fromUser', 'name profilePicture');

    res.json({ user, gigs, reviews });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('following', 'name profilePicture followers skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('followers', 'name profilePicture followers skills');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers,
  getQuickStats,
  followUser,
  getUserProfile,
  getFollowing,
  getFollowers,
};