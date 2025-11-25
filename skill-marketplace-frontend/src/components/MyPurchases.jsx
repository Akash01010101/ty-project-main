import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle, X, Trash2 } from 'lucide-react';
import { getOrders, confirmCompletion, deleteOrder } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';

// Order Card Component
const OrderCard = ({ order, onConfirmCompletion, onDeleteOrder }) => {
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
      className="backdrop-blur-lg rounded-lg p-4 sm:p-6 border hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-accent)',
        borderColor: 'var(--border-color)'
      }}
      onMouseEnter={(e) => e.target.style.borderColor = 'var(--text-accent)'}
      onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-color)'}
    >
      <div className="space-y-4">
        {/* Order Title and Seller */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{order.gig.title}</h3>
          <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
            <User className="w-4 h-4 mr-2" />
            <span className="text-sm">Seller - {order.seller.name}</span>
          </div>
        </div>

        {/* Order Details */}
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

        {/* Action Buttons */}
        {user && user._id === order.buyer._id && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {order.status === 'completed-by-seller' && (
              <button
                onClick={() => onConfirmCompletion(order._id)}
                className="w-full py-2 px-4 font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm"
                style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
              >
                Confirm Completion
              </button>
            )}
            {(order.status === 'completed' || order.status === 'cancelled') && (
              <button
                onClick={() => onDeleteOrder(order._id)}
                className="w-full py-2 px-4 border font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Order
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MyPurchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleConfirmCompletion = useCallback(async (orderId) => {
    try {
      const response = await confirmCompletion(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: response.order.status }
            : order
        )
      );
      alert('Order completed successfully!');
    } catch (error) {
      console.error('Error confirming order completion:', error);
      alert('Failed to confirm order completion.');
    }
  }, []);

  const handleDeleteOrder = useCallback(async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await deleteOrder(orderId);
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order.');
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Purchases</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your orders and confirm completion</p>
        </div>
      </div>

      <div className="backdrop-blur-lg rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
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
                  onConfirmCompletion={handleConfirmCompletion}
                  onDeleteOrder={handleDeleteOrder}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;

