import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle, Package, Timer } from 'lucide-react';
import { getMyPurchases, clearPayment } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import ReviewModal from './ReviewModal';

// Order Card Component
const OrderCard = ({ order, onClearPayment }) => {
  const { user } = useAuth();

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.2)', icon: CheckCircle };
      case 'in-progress':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)', icon: Clock };
      case 'pending':
        return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.2)', icon: AlertCircle };
      case 'completed-by-seller':
        return { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.2)', icon: CheckCircle };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)', icon: AlertCircle };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)', icon: Clock };
    }
  };

  const statusStyle = getStatusStyles(order.status);
  const StatusIcon = statusStyle.icon;

  const getSellerAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: statusStyle.text }}></div>

      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header: Date & Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <div 
            className="flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
            style={{ 
              backgroundColor: statusStyle.bg, 
              color: statusStyle.text,
              borderColor: statusStyle.border
            }}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {order.status.replace(/-/g, ' ')}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 leading-tight group-hover:text-[var(--text-accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
          {order.title}
        </h3>

        {/* Seller Info */}
        <div className="flex items-center mb-6 pb-4 border-b border-dashed" style={{ borderColor: 'var(--border-color)' }}>
          <img 
            src={getSellerAvatar(order.seller.name)} 
            alt={order.seller.name}
            className="w-8 h-8 rounded-full mr-3 border-2 border-[var(--bg-primary)] shadow-sm"
          />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Seller</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.seller.name}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="flex items-center text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign className="w-3.5 h-3.5 mr-1" />
              Price
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>${order.price}</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="flex items-center text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              <Timer className="w-3.5 h-3.5 mr-1" />
              Duration
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{order.duration}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {user && user._id === order.buyer._id && (
            <button
              onClick={() => onClearPayment(order)}
              disabled={order.status !== 'completed-by-seller'}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ backgroundColor: 'var(--button-primary)' }}
            >
              <CheckCircle className="w-4 h-4" />
              {order.status === 'completed-by-seller' ? 'Clear Payment' : 'Wait for Completion'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MyPurchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const { fetchUnreadCount } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyPurchases();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedOrderForReview(null);
    setIsReviewModalOpen(false);
  };

  const handleReviewSubmit = useCallback(async (reviewData) => {
    if (!selectedOrderForReview) return;

    try {
      const response = await clearPayment(selectedOrderForReview._id, reviewData);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === selectedOrderForReview._id
            ? { ...order, status: response.order.status }
            : order
        )
      );
      fetchUnreadCount();
      alert('Payment cleared successfully!');
    } catch (error) {
      console.error('Error clearing payment:', error);
      alert('Failed to clear payment.');
    } finally {
      handleCloseReviewModal();
    }
  }, [selectedOrderForReview, fetchUnreadCount]);

  return (
    <>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleReviewSubmit}
      />
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Purchases</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track your orders and clear payments</p>
          </div>
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="w-10 h-10 border-4 border-[var(--button-primary)] border-t-transparent rounded-full animate-spin"></div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading purchases...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <CheckCircle className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No purchases yet</h3>
              <p className="text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Your purchased orders will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onClearPayment={handleOpenReviewModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyPurchases;