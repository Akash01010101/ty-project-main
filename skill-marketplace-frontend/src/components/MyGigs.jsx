import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Star, Edit, Trash2, Share2, Eye, TrendingUp, ShoppingCart, DollarSign, Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { getMyGigs } from '../api/dashboard';
import { getMySales } from '../api/orders';

const ITEMS_PER_PAGE = 5;

const MyGigs = () => {
  const [userGigs, setUserGigs] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gigsData, salesData] = await Promise.all([
          getMyGigs(),
          getMySales()
        ]);
        setUserGigs(gigsData);
        setSales(salesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteGig = (gigId) => {
    setUserGigs(prev => prev.filter(gig => gig._id !== gigId));
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalEarnings = sales
      .filter(o => o.status === 'completed' || o.status === 'completed-by-seller')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    const totalImpressions = userGigs.reduce((total, gig) => total + (gig.impressions || 0), 0);
    const activeOrders = userGigs.reduce((total, gig) => total + (gig.activeOrders || 0), 0);
    const pendingApproval = userGigs.filter(gig => gig.status === 'Pending').length;
    const totalReviews = userGigs.reduce((total, gig) => total + (gig.reviewCount || 0), 0);
    const avgRating = userGigs.length > 0 
      ? (userGigs.reduce((total, gig) => total + (gig.rating || 0), 0) / userGigs.length).toFixed(1)
      : '0.0';

    return { totalEarnings, totalImpressions, activeOrders, pendingApproval, avgRating, totalReviews };
  }, [userGigs, sales]);

  // Filter and sort gigs
  const filteredGigs = useMemo(() => {
    let result = userGigs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(gig => 
        gig.title?.toLowerCase().includes(query) ||
        gig.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price-low':
        result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'rating':
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return result;
  }, [userGigs, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredGigs.length / ITEMS_PER_PAGE);
  const paginatedGigs = filteredGigs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          <div className="h-10 w-28 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Gigs</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage your service offerings and performance metrics.
          </p>
        </div>
        <Link to="/create-gig">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
            style={{ backgroundColor: 'var(--button-primary)', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            New Gig
          </motion.button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Earnings</span>
            <DollarSign className="w-5 h-5" style={{ color: 'var(--button-primary)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ${stats.totalEarnings.toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
            ↗ +12% this month
          </p>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Impressions</span>
            <Eye className="w-5 h-5" style={{ color: 'var(--button-primary)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatNumber(stats.totalImpressions || 12500)}
          </p>
          <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
            ↗ +5.2% this month
          </p>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Orders</span>
            <ShoppingCart className="w-5 h-5" style={{ color: 'var(--button-primary)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.activeOrders || userGigs.reduce((t, g) => t + (g.orders || 0), 0)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {stats.pendingApproval} pending approval
          </p>
        </div>

        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg. Rating</span>
            <Star className="w-5 h-5" style={{ color: '#eab308' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.avgRating}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            from {stats.totalReviews || 165} reviews
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search gigs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border min-w-[160px] justify-between"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Sort by:</span>
            <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          
          {showSortDropdown && (
            <div 
              className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg shadow-lg z-10 border"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
            >
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-primary)] transition-colors"
                  style={{ color: sortBy === option.value ? 'var(--button-primary)' : 'var(--text-primary)' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gigs List */}
      {paginatedGigs.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-16 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '2px dashed var(--border-color)' }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <Plus className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {searchQuery ? 'No gigs found' : 'No gigs yet'}
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {searchQuery ? 'Try a different search term' : 'Create your first gig to start earning'}
          </p>
          {!searchQuery && (
            <Link to="/create-gig">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'var(--button-primary)', color: '#fff' }}
              >
                Create Gig
              </motion.button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedGigs.map((gig, index) => (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              

              {/* Gig Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {gig.title}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {gig.category || 'Uncategorized'} {gig.subcategory && `> ${gig.subcategory}`}
                </p>
              </div>

              {/* Status */}
              <div className="text-center flex-shrink-0 hidden sm:block">
                <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Status</p>
                <span 
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: gig.status === 'Active' ? 'rgba(34,197,94,0.15)' : 
                                     gig.status === 'Draft' ? 'rgba(148,163,184,0.15)' : 'rgba(234,179,8,0.15)',
                    color: gig.status === 'Active' ? '#22c55e' : 
                           gig.status === 'Draft' ? '#94a3b8' : '#eab308'
                  }}
                >
                  {gig.status || 'Active'}
                </span>
              </div>

              {/* Rating */}
              <div className="text-center flex-shrink-0 hidden sm:block">
                <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-secondary)' }}>Rating</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5" style={{ color: '#eab308' }} fill="#eab308" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {gig.rating || 0}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    ({gig.reviewCount || 0})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  From ${gig.price || 0}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteGig(gig._id)}
                  className="p-2 rounded-lg transition-colors hover:text-red-400"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

export default MyGigs;