const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.userId })
      .populate('participants', 'name profilePicture')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const createConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    console.log('createConversation: req.user.userId', req.user.userId);
    console.log('createConversation: recipientId', recipientId);
    
    const participants = [req.user.userId, recipientId];

    let conversation = await Conversation.findOne({
      participants: { $all: participants },
    }).populate('participants', 'name profilePicture');

    if (conversation) {
      return res.json(conversation);
    }

    const newConversation = new Conversation({
      participants,
    });

    await newConversation.save();

    const populatedConversation = await Conversation.findById(newConversation._id).populate('participants', 'name profilePicture');

    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error('Error in createConversation:', error);
    res.status(500).send('Server Error');
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 'asc' });
      
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.id;

    const message = new Message({
      conversationId,
      sender: req.user.userId,
      text,
      readBy: [req.user.userId],
    });

    await message.save();

    const conversation = await Conversation.findById(conversationId);
    conversation.lastMessage = message._id;
    await conversation.save();
    
    // TODO: Emit message via socket.io

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, readBy: { $ne: req.user.userId } },
      { $addToSet: { readBy: req.user.userId } }
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).send('Server Error');
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.userId }).select('_id');
    const conversationIds = conversations.map(c => c._id);

    const count = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      readBy: { $ne: req.user.userId },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
