import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Star, Edit, Trash2, Eye, TrendingUp, Clock, Package, Sparkles } from 'lucide-react';
import { getMyGigs } from '../api/dashboard';

const MyGigs = () => {
  const [userGigs, setUserGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const data = await getMyGigs();
        setUserGigs(data);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const handleDeleteGig = (gigId) => {
    const updatedGigs = userGigs.filter(gig => gig._id !== gigId);
    setUserGigs(updatedGigs);
  };

  const totalOrders = userGigs.reduce((total, gig) => total + (gig.orders || 0), 0);
  const totalEarnings = userGigs.reduce((total, gig) => total + ((gig.price || 0) * (gig.orders || 0)), 0);
  const avgRating = userGigs.length > 0 
    ? (userGigs.reduce((total, gig) => total + (gig.rating || 0), 0) / userGigs.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
          <div className="h-10 w-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Gigs</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {userGigs.length} {userGigs.length === 1 ? 'service' : 'services'} listed
          </p>
        </div>
        <Link to="/create-gig" className="w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}
          >
            <Plus className="w-4 h-4" />
            New Gig
          </motion.button>
        </Link>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: userGigs.length, icon: Package, accent: 'var(--button-action)' },
          { label: 'Orders', value: totalOrders, icon: TrendingUp, accent: '#3b82f6' },
          { label: 'Earned', value: `$${totalEarnings}`, icon: Sparkles, accent: 'var(--button-action)' },
          { label: 'Rating', value: avgRating, icon: Star, accent: '#eab308' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.accent}20` }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.accent }} />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gigs List */}
      {userGigs.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-14 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}
        >
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--bg-accent)' }}
          >
            <Plus className="w-7 h-7" style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>No gigs yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Create your first gig to start earning</p>
          <Link to="/create-gig">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}
            >
              Create Gig
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {userGigs.map((gig, index) => (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="group flex items-center rounded-xl overflow-hidden transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              {/* Status Indicator */}
              <div 
                className="w-1 self-stretch flex-shrink-0"
                style={{ 
                  backgroundColor: gig.status === 'Active' ? '#22c55e' : '#eab308'
                }}
              />
              
              {/* Content */}
              <div className="flex-1 flex items-center gap-4 p-4">
                {/* Gig Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{gig.title}</h3>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 uppercase tracking-wide"
                      style={{ 
                        backgroundColor: gig.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                        color: gig.status === 'Active' ? '#22c55e' : '#eab308'
                      }}
                    >
                      {gig.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs truncate mb-1.5" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
                  <div className="flex items-center gap-2.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" fill="#facc15" />
                      <span>{gig.rating || 0}</span>
                    </div>
                    <span className="opacity-40">•</span>
                    <span>{gig.orders || 0} orders</span>
                    <span className="opacity-40">•</span>
                    <span>{gig.createdAt ? new Date(gig.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold" style={{ color: 'var(--button-action)' }}>${gig.price}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGig(gig._id)}
                    className="p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;