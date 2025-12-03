import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Search, MoreVertical, Paperclip, Smile, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import CreateOfferForm from './CreateOfferForm';
import { getConversations, getMessages, sendMessage, createConversation, markAsRead } from '../api/messages';
import { createOffer } from '../api/offers';
import { useAuth } from '../context/AuthContext';

// Message Item Component
const MessageItem = ({ message, isSelected, onClick, currentUser }) => {
  const otherParticipant = message.participants.find(p => p._id !== currentUser._id);

  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--button-secondary)' }}
      onClick={() => onClick(message)}
      className={`p-4 border-b cursor-pointer transition-all duration-200`}
      style={{
        borderColor: 'var(--border-color)',
        backgroundColor: isSelected ? 'var(--button-secondary)' : 'transparent'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <img
            src={otherParticipant.profilePicture.startsWith('http') ? otherParticipant.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${otherParticipant.profilePicture}`}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {/* {message.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 rounded-full" style={{ borderColor: 'var(--bg-primary)' }}></div>
          )} */}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{otherParticipant.name}</h3>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(message.updatedAt).toLocaleTimeString()}</span>
          </div>
          
          <p className="text-sm truncate mb-1" style={{ color: 'var(--text-secondary)' }}>{message.lastMessage?.text}</p>
          
          <div className="flex items-center justify-between">
            {/* <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{message.project}</span>
            {message.unreadCount > 0 && (
              <span className="text-xs px-2 py-1 rounded-full min-w-[20px] text-center" style={{ backgroundColor: 'var(--text-accent)', color: 'var(--bg-primary)' }}>
                {message.unreadCount}
              </span>
            )} */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Offer Message Component
const OfferMessage = ({ offer, isOwnMessage }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex justify-center my-4`}
  >
    <div className="w-full max-w-md p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)'}}>
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
        {isOwnMessage ? (
          <span className="text-xs px-2 py-1 rounded-full" style={{backgroundColor: 'var(--button-secondary)', color: 'var(--text-secondary)'}}>Pending</span>
        ) : (
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs font-medium rounded" style={{backgroundColor: 'var(--button-secondary)', color: 'var(--text-secondary)'}}>Decline</button>
            <button className="px-3 py-1 text-xs font-medium text-white rounded" style={{backgroundColor: 'var(--button-primary)'}}>Accept</button>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

// Chat Message Component
const ChatMessage = ({ message, isOwnMessage, sender }) => {
  if (message.type === 'offer') {
    return <OfferMessage offer={message.offer} isOwnMessage={isOwnMessage} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'text-white'
              : 'backdrop-blur-lg'
          }`}
          style={{
            backgroundColor: isOwnMessage ? 'var(--button-primary)' : 'var(--bg-accent)',
            color: isOwnMessage ? 'var(--bg-primary)' : 'var(--text-primary)'
          }}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        <div className={`flex items-center mt-1 space-x-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {/* {isOwnMessage && message.status && (
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{message.status}</span>
          )} */}
        </div>
      </div>
      
      {!isOwnMessage && (
        <img
          src={sender.profilePicture.startsWith('http') ? sender.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${sender.profilePicture}`}
          alt={sender.name}
          className="w-8 h-8 rounded-full object-cover order-1 mr-2"
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
  const { user: currentUser, unreadCount, setUnreadCount, fetchUnreadCount } = useAuth();
  const location = useLocation();
    const socket = useRef();
    const chatContainerRef = useRef(null);
    const selectedConversationRef = useRef(null);
  
    useEffect(() => {
      selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);
  
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chatMessages]);
    
    useEffect(() => {
          socket.current = io(import.meta.env.VITE_API_URL || 'http://localhost:9000');
          
          socket.current.on('getMessage', (data) => {
            if (data.conversationId === selectedConversationRef.current?._id) {
              setChatMessages((prev) => [...prev, data]);
            } else {
              fetchUnreadCount();
            }
          });
      
          socket.current.on('getOffer', (data) => {
            const newOfferMessage = {
              _id: data.offer._id,
              type: 'offer',
              offer: data.offer,
              sender: data.sender,
              createdAt: data.offer.createdAt,
            };
            setChatMessages((prev) => [...prev, newOfferMessage]);
          });  
      return () => {
        socket.current.disconnect();
      };
    }, []);
  
    useEffect(() => {
      if(currentUser?._id) {
        socket.current.emit('addUser', currentUser._id);
        socket.current.on('getUsers', (users) => {
          // console.log(users);
        });
      }
    }, [currentUser]);

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
          if (!conversations.find(c => c._id === conversation._id)) {
            // we need to refetch conversations to get the populated one
             const data = await getConversations();
             setConversations(data);
             setSelectedConversation(data.find(c => c._id === conversation._id));
          } else {
            setSelectedConversation(conversation);
          }
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
  }, [location.state]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      text: newMessage,
    };
    
    const receiver = selectedConversation.participants.find(p => p._id !== currentUser._id);

    socket.current.emit('sendMessage', {
      senderId: currentUser._id,
      receiverId: receiver._id,
      text: newMessage,
      conversationId: selectedConversation._id,
    });

    try {
      const data = await sendMessage(selectedConversation._id, message);
      const newMessageForState = {
        ...data,
        sender: currentUser
      };
      setChatMessages([...chatMessages, newMessageForState]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
      const newOffer = await createOffer(offer);
      const newOfferMessage = {
        _id: newOffer._id, // Using the id from the backend
        type: 'offer',
        offer: newOffer,
        sender: currentUser,
        createdAt: newOffer.createdAt,
      };

      socket.current.emit('sendOffer', {
        senderId: currentUser._id,
        receiverId: receiver._id,
        offer: newOffer,
      });

      setChatMessages(prev => [...prev, newOfferMessage]);
      setShowOfferForm(false);
    } catch (error) {
      console.error('Error sending offer:', error);
    }
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


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (selectedConversation) {
    const otherParticipant = selectedConversation.participants.find(p => p._id !== currentUser._id);
    return (
      <div className="space-y-6">
        {/* Chat Header */}
        <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
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
                  src={otherParticipant.profilePicture.startsWith('http') ? otherParticipant.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${otherParticipant.profilePicture}`}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {/* {selectedMessage.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 rounded-full" style={{ borderColor: 'var(--bg-primary)' }}></div>
                )} */}
              </div>
              
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{otherParticipant.name}</h3>
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
        <div ref={chatContainerRef} className="backdrop-blur-lg rounded-lg border min-h-[400px] max-h-[500px] overflow-y-auto p-4" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
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
                />
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-end space-x-3">
            <button
              type="button"
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{ color: 'var(--text-secondary)' }}
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
              disabled={!newMessage.trim()}
              className="p-2 rounded-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Messages</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect with clients and manage conversations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={handleSearchChange}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* Messages List */}
      <div className="backdrop-blur-lg rounded-lg border min-h-[500px]" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
              <Search className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No messages found</h3>
            <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filteredConversations.map((conversation) => (
              <MessageItem
                key={conversation._id}
                message={conversation}
                isSelected={selectedConversation?._id === conversation._id}
                onClick={handleConversationSelect}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
