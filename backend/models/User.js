const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  university: {
    type: String,
    default: 'State University',
    trim: true
  },
  profilePicture: {
    type: String,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    title: String,
    company: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String,
  }],
  education: [{
    school: String,
    degree: String,
    fieldofstudy: String,
    from: Date,
    to: Date,
    current: Boolean,
    description: String,
  }],
  resume: {
    type: String,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  totalGigs: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);