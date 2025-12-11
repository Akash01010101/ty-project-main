import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getMyPurchases, clearPayment } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import ReviewModal from './ReviewModal';

// Order Card Component
const OrderCard = ({ order, onClearPayment }) => {
  const { user } = useAuth();
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { color: '#22c55e' }; // Green
      case 'in-progress':
        return { color: 'var(--text-accent)' }; // Theme accent
      case 'pending':
        return { color: '#eab308' }; // Yellow
      case 'completed-by-seller':
        return { color: '#3b82f6' }; // Blue
      default:
        return { color: 'var(--text-secondary)' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed-by-seller':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border backdrop-blur-lg rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-secondary)'
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{order.title}</h3>
          <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
            <User className="w-4 h-4 mr-2" />
            <span className="text-sm">Seller - {order.seller.name}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm">Amount:</span>
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-accent)' }}>${order.price}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <div style={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
              </div>
              <span className="text-sm ml-2">Status:</span>
            </div>
            <span className="text-sm font-medium capitalize" style={getStatusColor(order.status)}>
              {order.status.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">Order Date:</span>
            </div>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {user && user._id === order.buyer._id && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => onClearPayment(order)}
              disabled={order.status !== 'completed-by-seller'}
              className="w-full py-2 px-4 font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
            >
              Clear Payment
            </button>
          </div>
        )}
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Purchases</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Track your orders and clear payments</p>
          </div>
        </div>

        <div className="glow-border backdrop-blur-lg rounded-lg min-h-[400px]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
                <CheckCircle className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No purchases yet</h3>
              <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Your purchased orders will appear here.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onClearPayment={handleOpenReviewModal}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyPurchases;
