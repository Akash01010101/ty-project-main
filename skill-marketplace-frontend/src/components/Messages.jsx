import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Search, MoreVertical, Paperclip, Smile, FileText, MessageCircle, X, CheckCheck, Phone, Video } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import CreateOfferForm from './CreateOfferForm';
import ConfirmationModal from './ConfirmationModal';
import { getConversations, getMessages, sendMessage, createConversation, markAsRead } from '../api/messages';
import { createOffer, updateOfferStatus } from '../api/offers';
import { createRazorpayOrder, verifyPayment } from '../api/payments';
import { useAuth } from '../context/AuthContext';

const PaymentPromptMessage = ({ order, onPay, currentUser }) => (
  <div className="flex justify-center my-4 w-full px-4">
    <div className="w-full max-w-sm p-4 rounded-lg shadow-md border-l-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderLeftColor: 'var(--button-action)' }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Offer Accepted</h4>
        <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 uppercase tracking-tight">{order.status}</span>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded bg-opacity-10" style={{ backgroundColor: 'var(--button-primary)' }}>
          <FileText size={20} style={{ color: 'var(--button-primary)' }} />
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Total Amount</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${order.price}</p>
        </div>
      </div>

      {currentUser._id === order.buyer._id && order.status === 'pending' && (
        <button 
          onClick={() => onPay(order)} 
          className="w-full py-2.5 text-sm font-bold text-white rounded-lg shadow-lg hover:opacity-90 transition-all active:scale-[0.98]" 
          style={{ backgroundColor: 'var(--button-primary)' }}
        >
          Pay Now
        </button>
      )}
    </div>
  </div>
);

const MessageItem = ({ message, isSelected, onClick, currentUser }) => {
  const otherParticipant = message.participants?.find(p => p._id !== currentUser?._id);
  if (!otherParticipant) return null;

  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name || 'User')}&background=random`;
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
    <div
      onClick={() => onClick(message)}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors duration-200 border-b border-[var(--border-color)] hover:bg-[var(--bg-accent)] ${isSelected ? 'bg-[var(--bg-accent)]' : 'bg-transparent'}`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={getProfilePictureUrl(otherParticipant.profilePicture)}
          alt={otherParticipant.name}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.name || 'User')}&background=random`; }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>
            {otherParticipant.name || 'Unknown User'}
          </h3>
          <span className={`text-xs whitespace-nowrap ml-2 ${message.unreadCount > 0 ? 'text-[var(--button-action)] font-medium' : 'text-[var(--text-secondary)]'}`}>
            {formatTime(message.updatedAt)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm truncate text-[var(--text-secondary)] max-w-[85%]">
            {message.lastMessage?.type === 'file' ? (
              <span className="flex items-center gap-1 font-medium italic"><Paperclip size={12} /> attachment</span>
            ) : (
              message.lastMessage?.text || 'Start a conversation'
            )}
          </p>
          
          {message.unreadCount > 0 && (
            <div className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--button-action)' }}>
              {message.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OfferMessage = ({ offer, isOwnMessage, onAccept, onDecline, onCancelOffer }) => (
  <div className="flex justify-center my-4 w-full px-4">
    <div className="w-full max-w-[320px] bg-[var(--bg-secondary)] rounded-xl shadow-lg p-4 border border-[var(--border-color)]">
      <div className="text-[10px] font-black uppercase tracking-widest mb-3 text-[var(--text-secondary)] flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-[var(--button-primary)]"></div>
        {isOwnMessage ? 'Sent Custom Offer' : 'Received Custom Offer'}
      </div>
      <div className="bg-[var(--bg-primary)] p-4 rounded-lg mb-4 border-l-4 border-[var(--button-primary)] shadow-inner">
        <div className="flex justify-between items-start mb-2">
          <div className="font-black text-2xl" style={{ color: 'var(--text-primary)' }}>${offer.amount}</div>
          <div className="text-[10px] px-2 py-1 rounded-full bg-[var(--bg-accent)] text-[var(--text-secondary)] font-bold">{offer.duration}</div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic line-clamp-3">"{offer.description}"</p>
      </div>
      
      {offer.status === 'pending' && (
        <div className="flex gap-2">
          {!isOwnMessage ? (
            <>
              <button onClick={() => onDecline(offer._id)} className="flex-1 py-2 text-sm font-bold rounded-lg bg-[var(--bg-accent)] text-[var(--text-primary)] hover:bg-red-500/10 hover:text-red-500 transition-all">Decline</button>
              <button onClick={() => onAccept(offer._id)} className="flex-1 py-2 text-sm font-bold rounded-lg text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all" style={{ backgroundColor: 'var(--button-primary)' }}>Accept</button>
            </>
          ) : (
            <button onClick={() => onCancelOffer(offer._id)} className="w-full py-2 text-sm font-bold rounded-lg bg-[var(--bg-accent)] text-red-500 hover:bg-red-500/10 transition-all">Cancel Offer</button>
          )}
        </div>
      )}
      
      {offer.status !== 'pending' && (
        <div className="text-center py-1 rounded bg-[var(--bg-accent)] text-xs font-black uppercase tracking-wider" style={{ color: offer.status === 'accepted' ? 'var(--button-action)' : 'var(--text-secondary)' }}>
          Offer {offer.status}
        </div>
      )}
    </div>
  </div>
);

const ChatMessage = ({ message, isOwnMessage, sender, onAccept, onDecline, onPay, onCancelOffer, currentUser }) => {
  if (message.type === 'offer' && message.offer?.status === 'accepted' && message.offer?.order) {
    return <PaymentPromptMessage order={message.offer.order} onPay={onPay} currentUser={currentUser} />;
  }
  if (message.type === 'offer') {
    return <OfferMessage offer={message.offer} isOwnMessage={isOwnMessage} onAccept={onAccept} onDecline={onDecline} onCancelOffer={onCancelOffer} />;
  }

  const isFile = message.type === 'file';
  const isImage = isFile && (message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) || message.fileUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const fullUrl = message.fileUrl?.startsWith('http') ? message.fileUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${message.fileUrl}`;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full mb-1 px-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-3 py-1.5 shadow-sm text-sm group
          ${isOwnMessage 
            ? 'rounded-l-lg rounded-br-lg rounded-tr-none' 
            : 'rounded-r-lg rounded-bl-lg rounded-tl-none bg-[var(--bg-secondary)]'
          }`}
        style={isOwnMessage ? { backgroundColor: 'var(--button-primary)', color: '#fff' } : { color: 'var(--text-primary)' }}
      >
        {isImage ? (
          <div className="mb-1 mt-1 overflow-hidden rounded shadow-inner">
            <img
              src={fullUrl}
              alt={message.fileName || 'Image'}
              className="max-w-full h-auto object-cover cursor-pointer"
              style={{ maxHeight: '300px' }}
              onClick={() => window.open(fullUrl, '_blank')}
            />
          </div>
        ) : isFile ? (
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-lg mb-1 border transition-colors ${isOwnMessage ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:bg-[var(--bg-accent)]'}`}
          >
            <div className={`p-2 rounded-full ${isOwnMessage ? 'bg-white/20' : 'bg-[var(--button-primary)]/10'}`}>
              <Paperclip size={16} className={isOwnMessage ? 'text-white' : 'text-[var(--button-primary)]'} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{message.fileName || 'Attachment'}</span>
              <span className="text-[10px] opacity-70 uppercase font-black">Download</span>
            </div>
          </a>
        ) : null}

        <div className="flex flex-col relative pb-3">
          {message.text && (
            <span className="whitespace-pre-wrap leading-relaxed pr-10">{message.text}</span>
          )}
          <div className={`absolute bottom-0 right-0 flex items-center gap-1 ${isOwnMessage ? 'text-white/70' : 'text-[var(--text-secondary)] opacity-70'}`}>
            <span className="text-[10px] font-medium">
              {message.createdAt ? formatTime(message.createdAt) : ''}
            </span>
            {isOwnMessage && (
              <CheckCheck size={14} className={message.readBy?.length > 1 ? 'text-blue-300' : 'text-white/70'} />
            )}
          </div>
        </div>
      </div>
    </div>
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
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false, type: null, data: null, title: '', message: '' });
  
  const { user: currentUser, fetchUnreadCount } = useAuth();
  const location = useLocation();
  const socket = useSocket();
  const chatContainerRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChatOnMobile, selectedFile]);

  useEffect(() => {
    if (!socket.current) return;

    const getMessageHandler = (data) => {
      if (data.conversationId === selectedConversationRef.current?._id) {
        setChatMessages((prev) => {
          if (prev.some((msg) => msg._id === data._id)) return prev;
          return [...prev, data];
        });
        markAsRead(data.conversationId);
      } else {
        fetchUnreadCount();
        setConversations(prev => prev.map(c => {
          if (c._id === data.conversationId) {
            return { ...c, lastMessage: data, unreadCount: (c.unreadCount || 0) + 1, updatedAt: new Date().toISOString() };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      }
    };

    const getOfferHandler = (data) => {
      const newOfferMessage = { _id: data.offer._id, type: 'offer', offer: data.offer, sender: data.sender, createdAt: data.offer.createdAt };
      setChatMessages((prev) => {
        if (prev.some((msg) => msg._id === newOfferMessage._id)) return prev;
        return [...prev, newOfferMessage];
      });
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
        if (currentUser) {
          const uniqueConversations = [];
          const seenParticipants = new Set();
          data.forEach(conv => {
            const otherPart = conv.participants.find(p => p._id !== currentUser._id);
            if (otherPart) {
              if (!seenParticipants.has(otherPart._id)) {
                seenParticipants.add(otherPart._id);
                uniqueConversations.push(conv);
              }
            } else {
              uniqueConversations.push(conv);
            }
          });
          setConversations(uniqueConversations);
        } else {
          setConversations(data);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };
    if (currentUser) fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    const startConversation = async () => {
      if (location.state && location.state.recipientId && currentUser) {
        try {
          const conversation = await createConversation({ recipientId: location.state.recipientId });
          setConversations(prev => {
            const existing = prev.find(c => c._id === conversation._id);
            if (existing) return prev;
            return [conversation, ...prev];
          });
          handleConversationSelect(conversation);
        } catch (error) {
          console.error('Error starting conversation:', error);
        }
        window.history.replaceState({}, document.title);
      }
    };
    startConversation();
  }, [location.state, currentUser]);

  const openConfirmation = (type, data, title, message) => setConfirmation({ isOpen: true, type, data, title, message });
  const closeConfirmation = () => setConfirmation({ isOpen: false, type: null, data: null, title: '', message: '' });

  const handleConfirmAction = async () => {
    const { type, data } = confirmation;
    closeConfirmation();
    switch (type) {
      case 'SEND_OFFER': await processSendOffer(data); break;
      case 'ACCEPT_OFFER': await processAcceptOffer(data); break;
      case 'PAYMENT': await processPayment(data); break;
      default: break;
    }
  };

  const processAcceptOffer = async (offerId) => {
    try {
      await updateOfferStatus(offerId, 'accepted');
      const data = await getMessages(selectedConversation._id);
      setChatMessages(data);
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    if (isMobileView) setShowChatOnMobile(true);
    try {
      const data = await getMessages(conversation._id);
      setChatMessages(data);
      await markAsRead(conversation._id);
      setConversations(prev => prev.map(c => c._id === conversation._id ? { ...c, unreadCount: 0 } : c));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
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
      const newMessageForState = { ...data, sender: currentUser };
      socket.current.emit('sendMessage', { receiverId: receiver._id, message: newMessageForState });
      setChatMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessageForState._id)) return prev;
        return [...prev, newMessageForState];
      });
      setConversations(prev => prev.map(c => c._id === selectedConversation._id ? { ...c, lastMessage: newMessageForState, updatedAt: new Date().toISOString() } : c).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const processSendOffer = async (offerData) => {
    if (!selectedConversation) return;
    const receiver = selectedConversation.participants.find(p => p._id !== currentUser._id);
    const offer = { ...offerData, toUser: receiver._id };
    try {
      const { message } = await createOffer(offer);
      socket.current.emit('sendMessage', { senderId: currentUser._id, receiverId: receiver._id, text: message.text, conversationId: selectedConversation._id, message: message });
      setChatMessages((prev) => [...prev, message]);
      setShowOfferForm(false);
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const processPayment = async (order) => {
    try {
      const razorpayOrder = await createRazorpayOrder({ orderId: order._id });
      const options = {
        key: 'rzp_test_Rmf6SEALUezF1v',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Skill Marketplace',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          await verifyPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
          const newMessages = chatMessages.map(msg => msg.order?._id === order._id ? { ...msg, order: { ...msg.order, status: 'in-progress' } } : msg);
          setChatMessages(newMessages);
        },
        prefill: { name: currentUser.name, email: currentUser.email },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error('Payment Error', error);
    }
  };

  const handleAcceptOffer = (offerId) => openConfirmation('ACCEPT_OFFER', offerId, 'Accept Offer?', 'Are you sure you want to accept this offer?');
  const handleDeclineOffer = async (offerId) => { try { await updateOfferStatus(offerId, 'declined'); setChatMessages(prev => prev.map(msg => msg.offer?._id === offerId ? { ...msg, offer: { ...msg.offer, status: 'declined' } } : msg)); } catch (error) { console.error(error); } };
  const handleCancelOffer = async (offerId) => { try { await updateOfferStatus(offerId, 'cancelled'); setChatMessages(prev => prev.map(msg => msg.offer?._id === offerId ? { ...msg, offer: { ...msg.offer, status: 'cancelled' } } : msg)); } catch (error) { console.error(error); } };
  const handlePayment = (order) => openConfirmation('PAYMENT', order, 'Proceed to Payment?', `Are you sure you want to pay $${order.price}?`);
  const handleSendOffer = (offerData) => openConfirmation('SEND_OFFER', offerData, 'Send Offer?', 'Are you sure you want to send this offer?');

  const filteredConversations = useMemo(() => {
    if (!currentUser) return [];
    const unique = [];
    const seen = new Set();
    conversations.forEach(c => {
      const other = c.participants.find(p => p._id !== currentUser._id);
      if (other && !seen.has(other._id)) {
        if (other.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          unique.push(c);
          seen.add(other._id);
        }
      }
    });
    return unique;
  }, [conversations, currentUser, searchTerm]);

  const isChatDisabled = chatMessages.some(msg => msg.type === 'offer' && msg.offer?.status === 'accepted' && msg.offer?.order?.status === 'pending');

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl shadow-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]">
      <ConfirmationModal isOpen={confirmation.isOpen} onClose={closeConfirmation} onConfirm={handleConfirmAction} title={confirmation.title} message={confirmation.message} />

      {/* Sidebar */}
      <div className={`w-full md:w-[380px] flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all ${isMobileView && showChatOnMobile ? 'hidden' : 'block'}`}>
        <div className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${currentUser?.profilePicture}`} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[var(--button-primary)]" 
              alt="Profile" 
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random`} 
            />
            <h2 className="font-black text-xl tracking-tight text-[var(--text-primary)]">Chats</h2>
          </div>
          <div className="flex gap-4 text-[var(--text-secondary)]">
            <MessageCircle className="w-5 h-5 cursor-pointer hover:text-[var(--button-primary)] transition-colors" />
            <MoreVertical className="w-5 h-5 cursor-pointer hover:text-[var(--button-primary)] transition-colors" />
          </div>
        </div>

        <div className="p-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[var(--button-primary)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border border-transparent focus:border-[var(--button-primary)] focus:outline-none transition-all placeholder-[var(--text-secondary)]/50" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center gap-3 opacity-40">
              <MessageCircle size={40} />
              <p className="text-sm font-bold uppercase tracking-widest">No chats</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <MessageItem key={conv._id} message={conv} isSelected={selectedConversation?._id === conv._id} onClick={handleConversationSelect} currentUser={currentUser} />
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[var(--bg-primary)] relative ${isMobileView && !showChatOnMobile ? 'hidden' : 'flex'}`}>
        {selectedConversation ? (
          <>
            <div className="px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowChatOnMobile(false); setSelectedConversation(null); }} className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <ArrowLeft size={24} />
                </button>
                {(() => {
                  const other = selectedConversation.participants.find(p => p._id !== currentUser._id);
                  return (
                    <div className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <img 
                          src={other?.profilePicture?.startsWith('http') ? other.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${other?.profilePicture}`} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--button-primary)] transition-all" 
                          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'User')}&background=random`} 
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[var(--text-primary)] leading-tight">{other?.name}</span>
                        <span className="text-[10px] text-green-500 font-black uppercase tracking-tighter">Online</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2 md:gap-5 text-[var(--text-secondary)]">
                <div className="hidden sm:flex items-center gap-4 border-r border-[var(--border-color)] pr-4 mr-2">
                  <Video className="w-5 h-5 cursor-pointer hover:text-[var(--button-primary)] transition-colors" />
                  <Phone className="w-5 h-5 cursor-pointer hover:text-[var(--button-primary)] transition-colors" />
                </div>
                <button onClick={() => setShowOfferForm(!showOfferForm)} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-[var(--button-action)]/10 text-[var(--button-action)] hover:bg-[var(--button-action)] hover:text-white transition-all border border-[var(--button-action)]/20 flex items-center gap-2">
                  {showOfferForm ? <X size={12} /> : <FileText size={12} />}
                  Custom Offer
                </button>
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-[var(--button-primary)] transition-colors" />
              </div>
            </div>

            <AnimatePresence>
              {showOfferForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] z-10 overflow-hidden shadow-xl">
                  <div className="p-6">
                    <CreateOfferForm onSendOffer={handleSendOffer} onCancel={() => setShowOfferForm(false)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 relative bg-opacity-50" ref={chatContainerRef} style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay' }}>
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] opacity-40">
                  <div className="p-6 rounded-full bg-[var(--bg-secondary)] mb-4 border border-[var(--border-color)]">
                    <MessageCircle size={48} />
                  </div>
                  <p className="font-black uppercase tracking-widest text-xs">Start your story</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <ChatMessage key={msg._id} message={msg} isOwnMessage={msg.sender._id === currentUser._id} sender={msg.sender} onAccept={handleAcceptOffer} onDecline={handleDeclineOffer} onPay={handlePayment} onCancelOffer={handleCancelOffer} currentUser={currentUser} />
                ))
              )}
            </div>

            <div className="p-3 md:p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              {isChatDisabled ? (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center text-xs font-bold text-red-500 uppercase tracking-widest">
                  Order pending payment. <button onClick={() => handleCancelOffer(chatMessages.find(m => m.type === 'offer')?.offer?._id)} className="ml-2 underline hover:opacity-80">Cancel Offer</button>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex gap-1 md:gap-2 mb-1">
                    <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--button-primary)] transition-colors rounded-full hover:bg-[var(--bg-accent)]">
                      <Smile size={22} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[var(--text-secondary)] hover:text-[var(--button-primary)] transition-colors rounded-full hover:bg-[var(--bg-accent)]">
                      <Paperclip size={22} />
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="hidden" />

                  <form onSubmit={handleSendMessage} className="flex-1 flex gap-3 items-end">
                    <div className="flex-1 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] flex flex-col justify-center px-4 py-2.5 min-h-[46px] shadow-inner focus-within:border-[var(--button-primary)] transition-all">
                      {selectedFile && (
                        <div className="flex justify-between items-center bg-[var(--button-primary)]/10 p-2 rounded-lg mb-2 text-[10px] font-bold border border-[var(--button-primary)]/20 animate-in slide-in-from-bottom-2">
                          <span className="truncate max-w-[200px] text-[var(--button-primary)] uppercase tracking-tighter">{selectedFile.name}</span>
                          <X size={14} className="cursor-pointer text-[var(--button-primary)] hover:scale-110" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} />
                        </div>
                      )}
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type something amazing..."
                        className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/40 font-medium"
                      />
                    </div>
                    <button type="submit" disabled={!newMessage.trim() && !selectedFile} className="p-3.5 bg-[var(--button-primary)] text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-90 flex-shrink-0">
                      <Send size={20} className="ml-0.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[var(--bg-secondary)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--text-primary) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
            <div className="w-32 h-32 mb-8 rounded-[40px] bg-gradient-to-tr from-[var(--button-primary)] to-[var(--button-action)] flex items-center justify-center shadow-2xl shadow-[var(--button-primary)]/30 animate-pulse">
              <MessageCircle size={64} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter italic">PEERLY CONNECT</h2>
            <p className="text-[var(--text-secondary)] text-sm max-w-sm font-medium leading-relaxed opacity-70">
              Pick a peer, start a project, or just say hi.<br />
              All conversations are end-to-end encrypted.
            </p>
            <div className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> Secured by Peerly Protocol
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;