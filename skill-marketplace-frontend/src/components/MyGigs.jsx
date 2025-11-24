import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Star, Edit, Trash2, Eye } from 'lucide-react';

const MyGigs = () => {
  const [userGigs, setUserGigs] = useState([]);

  // Load gigs from localStorage on component mount
  useEffect(() => {
    const loadGigs = () => {
      const savedGigs = JSON.parse(localStorage.getItem('userGigs') || '[]');
      setUserGigs(savedGigs);
    };
    
    loadGigs();
    
    // Listen for storage changes (when new gigs are created)
    const handleStorageChange = () => {
      loadGigs();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Mock user profile data
  const userProfile = {
    rating: 4.8,
    totalGigs: 23,
    skills: ['React Development', 'Math Tutoring']
  };

  const handleDeleteGig = (gigId) => {
    const updatedGigs = userGigs.filter(gig => gig.id !== gigId);
    setUserGigs(updatedGigs);
    localStorage.setItem('userGigs', JSON.stringify(updatedGigs));
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
        <Plus className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>You haven't created any gigs yet.</h3>
      <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>Start by creating your first gig to begin earning!</p>
      <Link to="/create-gig">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 font-medium rounded-lg transition-all duration-200"
          style={{ 
            background: 'var(--button-primary)',
            color: 'var(--button-text)'
          }}
        >
          Create Your First Gig
        </motion.button>
      </Link>
    </div>
  );

  const GigCard = ({ gig }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-lg rounded-lg p-6 border transition-all duration-200"
      style={{ 
        backgroundColor: 'var(--bg-accent)', 
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{gig.title}</h3>
          <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {gig.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--accent-secondary)', color: 'var(--accent-text)' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:items-end space-y-2">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>${gig.price}</div>
          <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{gig.rating} ({gig.reviews} reviews)</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>Status: <span className={`${gig.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{gig.status}</span></span>
          <span>Orders: {gig.orders}</span>
          <span>Created: {gig.createdAt}</span>
        </div>
        
        <div className="flex space-x-2">
          <button className="p-2 rounded transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 rounded transition-all duration-200" style={{ color: 'var(--text-secondary)' }}>
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDeleteGig(gig.id)}
            className="p-2 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Gigs</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your gigs and track performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="px-4 py-2 rounded-lg transition-all duration-200 text-sm border" style={{ backgroundColor: 'var(--accent-secondary)', color: 'var(--accent-text)', borderColor: 'var(--accent-primary)' }}>
            <span className="flex items-center justify-center">
              <span className="mr-2">✨</span>
              AI Optimize
            </span>
          </button>
          
          <Link to="/create-gig" className="w-full sm:w-auto">
            <button className="w-full px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium" style={{ background: 'var(--button-primary)', color: 'var(--button-text)' }}>
              <span className="flex items-center justify-center">
                <Plus className="w-4 h-4 mr-2" />
                Create New Gig
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {userGigs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{userGigs.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Gigs</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {userGigs.reduce((total, gig) => total + gig.orders, 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Orders</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-green-400">
              ${userGigs.reduce((total, gig) => total + (gig.price * gig.orders), 0)}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Earnings</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-yellow-400">{userProfile.rating}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Rating</div>
          </div>
        </div>
      )}

      {/* Gigs Content */}
      <div className="backdrop-blur-lg rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        {userGigs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6 space-y-4">
            {userGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;