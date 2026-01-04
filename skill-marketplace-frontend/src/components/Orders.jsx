import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getMySales, completeBySeller } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';

// Order Card Component
const OrderCard = ({ order, onMarkAsComplete }) => {
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
            <span className="text-sm">Buyer - {order.buyer.name}</span>
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

        {user && user._id === order.seller._id && order.status === 'in-progress' && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => onMarkAsComplete(order._id)}
              className="w-full py-2 px-4 font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm"
              style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
            >
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    type: null,
    data: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMySales();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const openConfirmation = (type, data, title, message) => {
    setConfirmation({ isOpen: true, type, data, title, message });
  };

  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, type: null, data: null, title: '', message: '' });
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmation;
    closeConfirmation();

    if (type === 'COMPLETE_ORDER') {
      await processCompleteOrder(data);
    }
  };

  const processCompleteOrder = async (orderId) => {
    try {
      const response = await completeBySeller(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: response.status }
            : order
        )
      );
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order.');
    }
  };

  const handleMarkAsComplete = useCallback((orderId) => {
    setConfirmation({
      isOpen: true,
      type: 'COMPLETE_ORDER',
      data: orderId,
      title: 'Complete Order?',
      message: 'Are you sure you want to mark this order as complete? This action cannot be undone.'
    });
  }, []);

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmation.title}
        message={confirmation.message}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Sales</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your client orders and track progress</p>
        </div>
      </div>

      <div className="glow-border backdrop-blur-lg rounded-lg min-h-[400px]" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-5 sm:py-16 sm:px-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
              <CheckCircle className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No sales yet</h3>
            <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Your sales will appear here once you start receiving them.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onMarkAsComplete={handleMarkAsComplete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
