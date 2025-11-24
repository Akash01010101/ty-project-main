const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  projectUrl: {
    type: String,
  },
  skills: {
    type: [String],
  },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
