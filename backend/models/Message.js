const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
  },
  type: {
    type: String,
    enum: ['text', 'offer', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
  },
  fileName: {
    type: String,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

messageSchema.pre('save', function (next) {
  if (this.type === 'text' && !this.text) {
    next(new Error('Text is required for text messages.'));
  } else if (this.type === 'offer' && !this.offer) {
    next(new Error('Offer is required for offer messages.'));
  } else if (this.type === 'file' && !this.fileUrl) {
    next(new Error('File URL is required for file messages.'));
  } else {
    next();
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;