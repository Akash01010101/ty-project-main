import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Search, MoreVertical, Paperclip, Smile, FileText, MessageCircle, Users, Clock, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CreateOfferForm from './CreateOfferForm';
import { getConversations, getMessages, sendMessage, createConversation, markAsRead } from '../api/messages';
import { createOffer, updateOfferStatus } from '../api/offers';
import { createRazorpayOrder, verifyPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';

const PaymentPromptMessage = ({ order, onPay, currentUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex justify-center my-4`}
  >
    <div className="w-full max-w-md p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center mb-3">
        <FileText className="w-5 h-5 mr-3" style={{ color: 'var(--text-accent)' }} />
        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Offer Accepted!
        </h4>
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Please complete the payment to start the order.</p>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price</div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>${order.price}</div>
        </div>
        {currentUser._id === order.buyer._id && order.status === 'pending' && (
          <button onClick={() => onPay(order)} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: 'var(--button-primary)' }}>Pay Now</button>
        )}
        {order.status !== 'pending' && (
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-secondary)' }}>{order.status}</span>
        )}
      </div>
    </div>
  </motion.div>
);

// Message Item Component
const MessageItem = ({ message, isSelected, onClick, currentUser, index }) => {
  const otherParticipant = message.participants?.find(p => p._id !== currentUser?._id);

  if (!otherParticipant) return null;

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return 'https://via.placeholder.com/48?text=User';
    if (profilePicture.startsWith('http')) return profilePicture;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${profilePicture}`;
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(message)}
      className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 mx-3 my-2 rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: isSelected
          ? 'var(--button-action)'
          : 'var(--bg-primary)',
        borderLeft: isSelected ? '3px solid var(--button-action)' : '3px solid transparent',
        border: isSelected ? 'none' : '1px solid var(--border-color)',
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={getProfilePictureUrl(otherParticipant.profilePicture)}
          alt={otherParticipant.name || 'User'}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
          style={{
            border: isSelected ? '2px solid rgba(255,255,255,0.4)' : '2px solid var(--border-color)'
          }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=User'; }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
          style={{
            backgroundColor: '#22c55e',
            borderColor: 'var(--bg-secondary)'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3
            className="font-semibold text-sm md:text-[15px] truncate"
            style={{ color: isSelected ? '#fff' : 'var(--text-primary)' }}
          >
            {otherParticipant.name || 'Unknown User'}
          </h3>
          <span
            className="text-[11px] flex-shrink-0 font-medium"
            style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}
          >
            {formatTime(message.updatedAt)}
          </span>
        </div>
        <p
          className="text-xs md:text-[13px] truncate leading-relaxed"
          style={{ color: isSelected ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)' }}
        >
          {message.lastMessage?.text || 'Start a conversation...'}
        </p>
      </div>

      {/* Arrow indicator */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0"
        style={{ color: isSelected ? '#fff' : 'var(--text-secondary)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Unread indicator */}
      {message.unreadCount > 0 && !isSelected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}
        >
          {message.unreadCount}
        </div>
      )}
    </motion.div>
  );
};

// Offer Message Component
const OfferMessage = ({ offer, isOwnMessage, onAccept, onDecline }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex justify-center my-4`}
  >
    <div className="glow-border w-full max-w-md p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex items-center mb-3">
        <FileText className="w-5 h-5 mr-3" style={{ color: 'var(--text-accent)' }} />
        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {isOwnMessage ? 'You sent an offer' : 'You received an offer'}
        </h4>
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{offer.description}</p>
      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Price</div>
          <div className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>${offer.amount}</div>
        </div>
        <div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration</div>
          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{offer.duration}</div>
        </div>
        {offer.status === 'pending' && !isOwnMessage && (
          <div className="flex space-x-2">
            <button onClick={() => onDecline(offer._id)} className="px-3 py-1 text-xs font-medium rounded" style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-secondary)' }}>Decline</button>
            <button onClick={() => onAccept(offer._id)} className="px-3 py-1 text-xs font-medium text-white rounded" style={{ backgroundColor: 'var(--button-primary)' }}>Accept</button>
          </div>
        )}
        {offer.status !== 'pending' && (
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-secondary)' }}>{offer.status}</span>
        )}
      </div>
    </div>
  </motion.div>
);

// Chat Message Component
const ChatMessage = ({ message, isOwnMessage, sender, onAccept, onDecline, onPay, onCancelOffer, currentUser }) => {
  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) {
      return 'https://via.placeholder.com/32?text=User';
    }
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    return `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${profilePicture}`;
  };

  if (message.type === 'offer' && message.offer?.status === 'accepted' && message.offer?.order) {
    return <PaymentPromptMessage order={message.offer.order} onPay={onPay} currentUser={currentUser} />;
  }
  if (message.type === 'offer') {
    return <OfferMessage offer={message.offer} isOwnMessage={isOwnMessage} onAccept={onAccept} onDecline={onDecline} onCancelOffer={onCancelOffer} />;
  }

  if (message.type === 'file') {
    const isImage = message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || message.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const fullUrl = message.fileUrl?.startsWith('http')
      ? message.fileUrl
      : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${message.fileUrl}`;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div
            className={`p-1 rounded-2xl ${isOwnMessage ? 'text-white' : 'backdrop-blur-lg'}`}
            style={{
              backgroundColor: isOwnMessage ? 'var(--button-primary)' : 'var(--bg-accent)',
              color: isOwnMessage ? 'var(--bg-primary)' : 'var(--text-primary)'
            }}
          >
            {isImage ? (
              <div className="overflow-hidden rounded-lg">
                <img
                  src={fullUrl}
                  alt={message.fileName || 'Image'}
                  className="max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '300px' }}
                  onClick={() => window.open(fullUrl, '_blank')}
                />
              </div>
            ) : (
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 hover:underline"
                style={{ color: 'inherit' }}
              >
                <Paperclip className="w-4 h-4" />
                <span className="truncate">{message.fileName || 'Attachment'}</span>
              </a>
            )}
            {message.text && <p className="mt-2 text-sm px-2">{message.text}</p>}
          </div>
          <div className={`flex items-center mt-1 space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>

        {!isOwnMessage && sender && (
          <img
            src={getProfilePictureUrl(sender.profilePicture)}
            alt={sender.name || 'User'}
            className="w-8 h-8 rounded-full object-cover order-1 mr-2"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/32?text=User';
            }}
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${isOwnMessage
            ? 'text-white'
            : 'backdrop-blur-lg'
            }`}
          style={{
            backgroundColor: isOwnMessage ? 'var(--button-primary)' : 'var(--bg-accent)',
            color: isOwnMessage ? 'var(--bg-primary)' : 'var(--text-primary)'
          }}
        >
          <p className="text-sm">{message.text || ''}</p>
        </div>
        <div className={`flex items-center mt-1 space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}</span>
        </div>
      </div>

      {!isOwnMessage && sender && (
        <img
          src={getProfilePictureUrl(sender.profilePicture)}
          alt={sender.name || 'User'}
          className="w-8 h-8 rounded-full object-cover order-1 mr-2"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/32?text=User';
          }}
        />
      )}
    </motion.div>
  );
};

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user: currentUser, unreadCount, setUnreadCount, fetchUnreadCount } = useAuth();
  const location = useLocation();
  const socket = useSocket();
  const chatContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!socket.current) return;

    const getMessageHandler = (data) => {
      if (data.conversationId === selectedConversationRef.current?._id) {
        setChatMessages((prev) => [...prev, data]);
      } else {
        fetchUnreadCount();
      }
    };

    const getOfferHandler = (data) => {
      const newOfferMessage = {
        _id: data.offer._id,
        type: 'offer',
        offer: data.offer,
        sender: data.sender,
        createdAt: data.offer.createdAt,
      };
      setChatMessages((prev) => [...prev, newOfferMessage]);
    };

    socket.current.on('getMessage', getMessageHandler);
    socket.current.on('getOffer', getOfferHandler);

    return () => {
      socket.current.off('getMessage', getMessageHandler);
      socket.current.off('getOffer', getOfferHandler);
    };
  }, [socket, fetchUnreadCount]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const startConversation = async () => {
      if (location.state && location.state.recipientId) {
        try {
          const conversation = await createConversation({ recipientId: location.state.recipientId });

          setConversations(prev => {
            const existing = prev.find(c => c._id === conversation._id);
            if (existing) {
              return prev;
            }
            return [conversation, ...prev];
          });

          setSelectedConversation(conversation);
          const data = await getMessages(conversation._id);
          setChatMessages(data);
          await markAsRead(conversation._id);
          fetchUnreadCount();
        } catch (error) {
          console.error('Error starting conversation:', error);
        }
        window.history.replaceState({}, document.title);
      }
    };
    startConversation();
  }, [location.state, fetchUnreadCount]);

  const handleAcceptOffer = async (offerId) => {
    try {
      await updateOfferStatus(offerId, 'accepted');
      const data = await getMessages(selectedConversation._id);
      setChatMessages(data);
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleDeclineOffer = async (offerId) => {
    try {
      await updateOfferStatus(offerId, 'declined');
      const newMessages = chatMessages.map(msg =>
        msg.offer?._id === offerId ? { ...msg, offer: { ...msg.offer, status: 'declined' } } : msg
      );
      setChatMessages(newMessages);
    } catch (error) {
      console.error('Error declining offer:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const data = await getMessages(conversation._id);
      setChatMessages(data);
      await markAsRead(conversation._id);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

    let messagePayload;
    if (selectedFile) {
      const formData = new FormData();
      formData.append('messageFile', selectedFile);
      if (newMessage.trim()) formData.append('text', newMessage);
      messagePayload = formData;
    } else {
      messagePayload = { text: newMessage };
    }

    const receiver = selectedConversation.participants.find(p => p._id !== currentUser._id);

    try {
      const data = await sendMessage(selectedConversation._id, messagePayload);
      const newMessageForState = {
        ...data,
        sender: currentUser
      };

      socket.current.emit('sendMessage', {
        receiverId: receiver._id,
        message: newMessageForState,
      });

      setChatMessages([...chatMessages, newMessageForState]);
      setNewMessage('');
      handleRemoveFile();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSendOffer = async (offerData) => {
    if (!selectedConversation) return;

    const receiver = selectedConversation.participants.find(p => p._id !== currentUser._id);
    const offer = {
      ...offerData,
      toUser: receiver._id,
    };

    try {
      const { message } = await createOffer(offer);

      socket.current.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: receiver._id,
        text: message.text,
        conversationId: selectedConversation._id,
        message: message, // Send the whole message
      });

      setChatMessages(prev => [...prev, message]);
      setShowOfferForm(false);
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const handleCancelOffer = async (offerId) => {
    try {
      await updateOfferStatus(offerId, 'cancelled');
      const newMessages = chatMessages.map(msg =>
        msg.offer?._id === offerId ? { ...msg, offer: { ...msg.offer, status: 'cancelled' } } : msg
      );
      setChatMessages(newMessages);
    } catch (error) {
      console.error('Error cancelling offer:', error);
    }
  };

  const handlePayment = async (order) => {
    const razorpayOrder = await createRazorpayOrder({ orderId: order._id });

    const options = {
      key: 'rzp_test_Rmf6SEALUezF1v',
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Your App Name',
      description: 'Test Transaction',
      order_id: razorpayOrder.id,
      handler: async function (response) {
        await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        alert('Payment successful');
        // Refresh messages or update order status in UI
        const newMessages = chatMessages.map(msg =>
          msg.order?._id === order._id ? { ...msg, order: { ...msg.order, status: 'in-progress' } } : msg
        );
        setChatMessages(newMessages);
      },
      prefill: {
        name: currentUser.name,
        email: currentUser.email,
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleMessageInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = conversation.participants.find(p => p._id !== currentUser._id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const isChatDisabled = chatMessages.some(msg => msg.type === 'offer' && msg.offer?.status === 'accepted' && msg.offer?.order?.status === 'pending');

  console.log('chatMessages:', chatMessages);

  if (selectedConversation) {
    const otherParticipant = selectedConversation.participants?.find(p => p._id !== currentUser?._id);

    // Helper function to get profile picture URL
    const getProfilePictureUrl = (profilePicture) => {
      if (!profilePicture) {
        return 'https://via.placeholder.com/40?text=User';
      }
      if (profilePicture.startsWith('http')) {
        return profilePicture;
      }
      return `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${profilePicture}`;
    };

    return (
      <div className="space-y-6">
        {/* Chat Header */}
        <div className="glow-border-static backdrop-blur-lg rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={getProfilePictureUrl(otherParticipant?.profilePicture)}
                  alt={otherParticipant?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40?text=User';
                  }}
                />
                {/* {selectedMessage.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 rounded-full" style={{ borderColor: 'var(--bg-primary)' }}></div>
                )} */}
              </div>

              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{otherParticipant?.name || 'Unknown User'}</h3>
                {/* <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedMessage.project}</p> */}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOfferForm(!showOfferForm)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200" style={{ color: 'var(--text-accent)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
                {showOfferForm ? 'Cancel Offer' : 'Create Offer'}
              </button>
              <button
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Create Offer Form */}
        <AnimatePresence>
          {showOfferForm && (
            <CreateOfferForm
              onSendOffer={handleSendOffer}
              onCancel={() => setShowOfferForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="glow-border backdrop-blur-lg rounded-lg min-h-[400px] max-h-[500px] flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div ref={chatContainerRef} className="overflow-y-auto p-4 flex-1 min-h-0">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p style={{ color: 'var(--text-secondary)' }}>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatMessages.map((message) => (
                  <ChatMessage
                    key={message._id}
                    message={message}
                    isOwnMessage={message.sender._id === currentUser._id}
                    sender={message.sender}
                    onAccept={handleAcceptOffer}
                    onDecline={handleDeclineOffer}
                    onPay={handlePayment}
                    onCancelOffer={handleCancelOffer}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        {isChatDisabled ? (
          <div className="text-center p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Payment is pending. The chat is disabled.</p>
            <button onClick={() => handleCancelOffer(chatMessages.find(msg => msg.type === 'payment-prompt').offer._id)} className="text-xs text-red-500 hover:underline">Cancel Offer</button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="glow-border-static backdrop-blur-lg rounded-lg p-4 relative" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="mx-1 p-2 rounded-xl border flex items-center justify-between shadow-sm overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {selectedFile.type.startsWith('image/') ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--bg-accent)' }}>
                        <Paperclip className="w-6 h-6" style={{ color: 'var(--text-accent)' }} />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-full transition-colors hover:bg-red-500/10 text-red-500 flex-shrink-0 ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end space-x-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ color: selectedFile ? 'var(--text-accent)' : 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={handleMessageInputChange}
                  placeholder="Type your message..."
                  rows={2}
                  autoComplete="off"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>

              <button
                type="button"
                className="p-2 rounded-lg transition-colors hover:scale-105"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={!newMessage.trim() && !selectedFile}
                className="p-2 rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <p className="text-xs md:text-sm mt-0.5 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>Connect with clients and manage conversations</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
        {[
          { label: 'Chats', labelFull: 'Conversations', value: conversations.length, icon: MessageCircle, accent: 'var(--button-action)' },
          { label: 'Active', labelFull: 'Active Chats', value: conversations.filter(c => c.lastMessage).length, icon: Users, accent: '#3b82f6' },
          {
            label: 'Week', labelFull: 'This Week', value: conversations.filter(c => {
              const d = new Date(c.updatedAt);
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return d > weekAgo;
            }).length, icon: Clock, accent: '#a855f7'
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${stat.accent}15`,
              }}
            >
              <stat.icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: stat.accent }} />
            </div>
            <div className="min-w-0">
              <div className="text-lg md:text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-[10px] md:text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="sm:hidden">{stat.label}</span>
                <span className="hidden sm:inline">{stat.labelFull}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="animated-spin-border">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] text-sm focus:outline-none transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Messages List */}
      <div
        className="relative rounded-2xl min-h-[320px] md:min-h-[420px] overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Header bar inside */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {filteredConversations.length} conversations
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-secondary)' }}>Recent</span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-20 px-4">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{
                backgroundColor: 'var(--bg-accent)',
                border: '1px solid var(--border-color)'
              }}
            >
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10" style={{ color: 'var(--button-action)' }} />
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchTerm ? 'No matches' : 'No messages yet'}
            </h3>
            <p className="text-xs md:text-sm text-center max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm ? 'Try a different search' : 'When you start a chat, it will appear here'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredConversations.map((conversation, index) => (
              <MessageItem
                key={conversation._id}
                message={conversation}
                isSelected={selectedConversation?._id === conversation._id}
                onClick={handleConversationSelect}
                currentUser={currentUser}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
