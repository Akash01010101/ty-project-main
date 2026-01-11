import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, MessageCircle, UserPlus, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchUsers } from '../api/dashboard';
import { followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

// Define skill categories with keywords for matching (original categories)
const SKILL_CATEGORIES = {
  'Tech': [
    'software', 'develop', 'program', 'stack', 'web', 'app', 'mobile', 'frontend', 'backend',
    'java', 'script', 'python', 'c++', 'c#', 'ruby', 'go', 'swift', 'kotlin', 'php', 'html', 'css', 
    'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'sql', 'mongo', 'data', 'ai', 'ml', 'robotics'
  ],
  'Cybersecurity': [
    'cyber', 'security', 'hack', 'penetration', 'forensic', 'vulnerability', 'cryptography', 'infosec', 'network security', 'cissp', 'ceh'
  ],
  'Commerce': [
    'account', 'commerce', 'finance', 'audit', 'tax', 'tally', 'excel', 'business', 'sales', 'marketing', 'econ', 'cpa', 'ca', 'gst'
  ],
  'DevOps': [
    'devops', 'cloud', 'aws', 'azure', 'google cloud', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'linux', 'server', 'terraform', 'ansible', 'deployment'
  ],
  'Designing': [
    'design', 'ui', 'ux', 'graphic', 'art', 'logo', 'adobe', 'figma', 'sketch', 'photoshop', 'illustrator', 'video', 'animation', 'edit', 'creative'
  ]
};

const ITEMS_PER_PAGE = 8;

// Hook to detect theme
const useThemeColors = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const checkTheme = () => {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') { setIsDark(true); return; }
      if (stored === 'light') { setIsDark(false); return; }
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const interval = setInterval(checkTheme, 500);

    return () => { observer.disconnect(); clearInterval(interval); };
  }, []);

  return useMemo(() => ({
    accent: isDark ? '#22c55e' : '#3b82f6',
    accentBg: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    accentText: isDark ? '#000' : '#fff',
  }), [isDark]);
};

// Get category color (updated for original categories)
const getCategoryStyle = (category, themeColors) => {
  const colors = {
    'Tech': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    'Cybersecurity': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    'Commerce': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'DevOps': { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316' },
    'Designing': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
  };
  return colors[category] || { bg: themeColors.accentBg, text: themeColors.accent };
};

// User Card Component
const UserCard = ({ user, onMessage, onFollow, currentUser, themeColors }) => {
  const isFollowing = user.followers?.includes(currentUser?._id);
  
  // Determine user's primary category based on skills
  const getUserCategory = () => {
    if (!user.skills || user.skills.length === 0) return 'Tech';
    
    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
      const hasMatch = user.skills.some(skill => {
        if (!skill || typeof skill !== 'string') return false;
        const lowerSkill = skill.toLowerCase();
        return keywords.some(keyword => lowerSkill.includes(keyword));
      });
      if (hasMatch) return category;
    }
    return 'Tech';
  };

  const category = getUserCategory();
  const categoryStyle = getCategoryStyle(category, themeColors);

  // Fixed: Handle both full URLs and relative paths for profile pictures
  const getAvatarUrl = (name, profilePicture) => {
    if (!profilePicture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random&size=128`;
    }
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    // Handle relative paths - prepend API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';
    return `${apiUrl}/${profilePicture.replace(/\\/g, '/')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl text-center relative"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
    >
      {/* Online indicator */}
      {user.isOnline && (
        <div 
          className="absolute top-4 right-4 w-3 h-3 rounded-full border-2"
          style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg-secondary)' }}
        />
      )}

      {/* Avatar - Clickable to go to profile */}
      <Link to={`/profile/${user._id}`} className="relative inline-block mb-4 cursor-pointer group">
        <img
          src={getAvatarUrl(user.name, user.profilePicture)}
          alt={user.name}
          className="w-20 h-20 rounded-full object-cover mx-auto border-4 transition-transform group-hover:scale-105"
          style={{ borderColor: 'var(--bg-primary)' }}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random&size=128`;
          }}
        />
        {user.isOnline && (
          <div 
            className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
            style={{ backgroundColor: '#22c55e', borderColor: 'var(--bg-secondary)' }}
          />
        )}
      </Link>

      {/* Name - Clickable to go to profile */}
      <Link to={`/profile/${user._id}`}>
        <h3 
          className="font-bold text-base mb-2 hover:underline cursor-pointer" 
          style={{ color: 'var(--text-primary)' }}
        >
          {user.name}
        </h3>
      </Link>

      {/* Category Badge */}
      <span 
        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
        style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
      >
        {category}
      </span>

      {/* Role/Bio */}
      <p className="text-sm mb-5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
        {user.bio || user.skills?.[0] || 'Member'}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onMessage(user); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border hover:opacity-80"
          style={{ 
            borderColor: 'var(--border-color)', 
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onFollow(user); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ 
            backgroundColor: isFollowing ? 'var(--bg-primary)' : themeColors.accent,
            color: isFollowing ? 'var(--text-primary)' : themeColors.accentText,
            border: isFollowing ? '1px solid var(--border-color)' : 'none'
          }}
        >
          <UserPlus className="w-4 h-4" />
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </motion.div>
  );
};

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const themeColors = useThemeColors();

  useEffect(() => {
    const handleSearch = async () => {
      setLoading(true);
      try {
        const data = await searchUsers(searchTerm);
        setUsers(data);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleMessage = useCallback((user) => {
    navigate('/dashboard?tab=messages', { 
      state: { 
        recipientId: user._id, 
        recipientName: user.name, 
        recipientProfilePicture: user.profilePicture 
      } 
    });
  }, [navigate]);

  const handleFollow = useCallback(async (targetUser) => {
    try {
      await followUser(targetUser._id);
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === targetUser._id) {
            const isFollowing = user.followers?.includes(currentUser._id);
            const newFollowers = isFollowing
              ? user.followers.filter(id => id !== currentUser._id)
              : [...(user.followers || []), currentUser._id];
            return { ...user, followers: newFollowers };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [currentUser?._id]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (selectedCategory === 'All') return true;

      const keywords = SKILL_CATEGORIES[selectedCategory];
      if (!keywords) return true;

      return user.skills?.some(skill => {
        if (!skill || typeof skill !== 'string') return false;
        const lowerSkill = skill.toLowerCase();
        return keywords.some(keyword => lowerSkill.includes(keyword));
      });
    });
  }, [users, selectedCategory]);

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  // Updated categories using original names
  const categories = ['All', ...Object.keys(SKILL_CATEGORIES)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Search Users
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Find and connect with talented people.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search by username, name, or bio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm border outline-none transition-all"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Category Filters - using original category names */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => { setSelectedCategory(category); setVisibleCount(ITEMS_PER_PAGE); }}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedCategory === category ? themeColors.accent : 'var(--bg-secondary)',
              color: selectedCategory === category ? themeColors.accentText : 'var(--text-secondary)',
              border: `1px solid ${selectedCategory === category ? themeColors.accent : 'var(--border-color)'}`,
            }}
          >
            {category === 'All' ? 'All Skills' : category}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div 
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4"
              style={{ borderColor: themeColors.accent, borderTopColor: 'transparent' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>Searching users...</p>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <User className="w-10 h-10" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No users found
            </h3>
            <p className="text-center max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search criteria or filters.'
                : 'No users available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onMessage={handleMessage}
                onFollow={handleFollow}
                currentUser={currentUser}
                themeColors={themeColors}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredUsers.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all border"
            style={{ 
              borderColor: 'var(--border-color)', 
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            Load More Users
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearch;