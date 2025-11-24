import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { getOrders, approveOrder, rejectOrder } from '../api/dashboard';

// Order Card Component
const OrderCard = ({ order, onApproveOrder, onRejectOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { color: '#22c55e' }; // Green
      case 'in-progress':
        return { color: 'var(--text-accent)' }; // Theme accent
      case 'pending':
        return { color: '#eab308' }; // Yellow
      case 'approved':
        return { color: '#22c55e' }; // Green
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
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
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
        {/* Order Title and Client */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{order.gig.title}</h3>
          <div className="flex items-center" style={{ color: 'var(--text-secondary)' }}>
            <User className="w-4 h-4 mr-2" />
            <span className="text-sm">Current User - {order.buyer.name}</span>
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
        {order.status === 'pending' && (
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            {order.isApproved ? (
              <div className="flex items-center justify-center py-2">
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#22c55e' }} />
                <span className="font-medium" style={{ color: '#22c55e' }}>Order Approved</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => onApproveOrder(order._id)}
                  className="flex-1 py-2 px-4 font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm"
                  style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}
                >
                  Approve Order
                </button>
                <button
                  onClick={() => onRejectOrder(order._id)}
                  className="flex-1 py-2 px-4 border font-medium rounded-lg hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444', 
                    borderColor: 'rgba(239, 68, 68, 0.3)' 
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject Order
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Orders = () => {
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

  const handleApproveOrder = useCallback(async (orderId) => {
    console.log('Attempting to approve order:', orderId);
    try {
      const response = await approveOrder(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: response.order.status }
            : order
        )
      );
      alert('Order approved successfully!');
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order.');
    }
  }, []);

  const handleRejectOrder = useCallback(async (orderId) => {
    console.log('Attempting to reject order:', orderId);
    try {
      const response = await rejectOrder(orderId);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: response.order.status }
            : order
        )
      );
      alert('Order rejected successfully!');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order.');
    }
  }, []);

  const getOrderStats = () => {
    const completed = orders.filter(order => order.status === 'completed').length;
    const inProgress = orders.filter(order => order.status === 'in-progress').length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const totalEarnings = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.price, 0);

    return { completed, inProgress, pending, totalEarnings };
  };

  const stats = getOrderStats();


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Orders</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your client orders and track progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.completed}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</div>
        </div>
        <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>{stats.inProgress}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>In Progress</div>
        </div>
        <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="text-2xl font-bold" style={{ color: '#eab308' }}>{stats.pending}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending</div>
        </div>
        <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>${stats.totalEarnings}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Earned</div>
        </div>
      </div>

      {/* Orders List */}
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
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No orders yet</h3>
            <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Your client orders will appear here once you start receiving them</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onApproveOrder={handleApproveOrder}
                  onRejectOrder={handleRejectOrder}
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