import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, User, CheckCircle, Clock, AlertCircle, Package, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getMySales, completeBySeller } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';

// Order Card Component
const OrderCard = ({ order, onMarkAsComplete, onViewDetails }) => {
  const { user } = useAuth();

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Completed', dot: true };
      case 'in-progress':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'In Progress', dot: true };
      case 'pending':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', label: 'Review', dot: true };
      case 'completed-by-seller':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', label: 'Awaiting', dot: true };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Cancelled', dot: false };
      case 'late':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Late', dot: false, icon: '⚠' };
      case 'revision':
        return { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', label: 'Revision', dot: true };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', label: status, dot: false };
    }
  };

  const statusStyle = getStatusStyles(order.status);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isLate = order.status === 'late' || (order.dueDate && new Date(order.dueDate) < new Date() && order.status === 'in-progress');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border flex flex-col h-full"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Header: Title & Status */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 
          className="font-semibold text-base leading-tight line-clamp-1 flex-1" 
          style={{ color: 'var(--text-primary)' }}
          title={order.title}
        >
          {order.title}
        </h3>
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
          style={{ 
            backgroundColor: statusStyle.bg, 
            color: statusStyle.text,
          }}
        >
          {statusStyle.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.text }}></span>}
          {statusStyle.icon && <span>{statusStyle.icon}</span>}
          {statusStyle.label}
        </div>
      </div>

      {/* Description */}
      <p 
        className="text-sm mb-4 line-clamp-1" 
        style={{ color: 'var(--text-secondary)' }}
      >
        {order.description || 'No description provided'}
      </p>

      {/* Buyer Info */}
      <div className="flex items-center gap-2 mb-2">
        <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {order.buyer?.name || 'Unknown'}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <span 
          className="text-sm"
          style={{ color: isLate ? '#ef4444' : 'var(--text-secondary)' }}
        >
          {isLate ? 'Due: ' : ''}{formatDate(order.dueDate || order.createdAt)}
        </span>
      </div>

      {/* Footer: Price & Actions */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-lg font-bold" style={{ color: 'var(--text-accent)' }}>
          $ {order.price?.toFixed(2) || '0.00'}
        </span>
        
        <div className="flex items-center gap-2">
          {user && user._id === order.seller?._id && order.status === 'in-progress' && (
            <button
              onClick={() => onMarkAsComplete(order._id)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--text-accent)' }}
            >
              Complete
            </button>
          )}
          <button
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ITEMS_PER_PAGE = 8;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalEarned = orders
      .filter(o => o.status === 'completed' || o.status === 'completed-by-seller')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    
    const activeOrders = orders.filter(o => o.status === 'in-progress' || o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'completed-by-seller').length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthEarnings = orders
      .filter(o => 
        (o.status === 'completed' || o.status === 'completed-by-seller') && 
        new Date(o.createdAt) >= thisMonth
      )
      .reduce((sum, o) => sum + (o.price || 0), 0);

    return { totalEarned, activeOrders, completedOrders, thisMonthEarnings };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter === 'active') {
      result = result.filter(o => o.status === 'in-progress' || o.status === 'pending');
    } else if (activeFilter === 'completed') {
      result = result.filter(o => o.status === 'completed' || o.status === 'completed-by-seller');
    } else if (activeFilter === 'cancelled') {
      result = result.filter(o => o.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.title?.toLowerCase().includes(query) || 
        o.buyer?.name?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [orders, activeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

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
          order._id === orderId ? { ...order, status: response.status } : order
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

  const filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmation.title}
        message={confirmation.message}
      />

      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Sales</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your client orders and track progress.</p>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Earned</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>${stats.totalEarned.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-color)] hidden sm:block"></div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active Orders</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.activeOrders}</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-color)] hidden sm:block"></div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completed</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.completedOrders}</p>
          </div>
          <div className="w-px h-10 bg-[var(--border-color)] hidden sm:block"></div>
          <div className="text-center">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>This Month</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-accent)' }}>+${stats.thisMonthEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeFilter === filter.key ? 'var(--button-primary)' : 'var(--bg-secondary)',
                color: activeFilter === filter.key ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeFilter === filter.key ? 'var(--button-primary)' : 'var(--border-color)'}`,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--button-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading sales...</p>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
              <Package className="w-10 h-10" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {searchQuery || activeFilter !== 'all' ? 'No orders found' : 'No sales yet'}
            </h3>
            <p className="text-center max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your filters or search query.' 
                : 'Your sales will appear here once you start receiving orders.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onMarkAsComplete={handleMarkAsComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {getPaginationNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: currentPage === page ? 'var(--button-primary)' : 'var(--bg-secondary)',
                  color: currentPage === page ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;