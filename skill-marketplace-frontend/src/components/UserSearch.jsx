import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, MapPin, Star, MessageCircle, UserPlus, Filter } from 'lucide-react';
import { searchUsers } from '../api/dashboard';
import { followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import UserItem from './UserItem';

// Define skill categories with keywords for matching
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

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

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
    navigate('/dashboard?tab=messages', { state: { recipientId: user._id, recipientName: user.name, recipientProfilePicture: user.profilePicture } });
  }, [navigate]);

  const handleFollow = useCallback(async (targetUser) => {
    try {
      await followUser(targetUser._id);
      setUsers(prevUsers =>
        prevUsers.map(user => {
          if (user._id === targetUser._id) {
            const isFollowing = user.followers.includes(currentUser._id);
            const newFollowers = isFollowing
              ? user.followers.filter(id => id !== currentUser._id)
              : [...user.followers, currentUser._id];
            return {
              ...user,
              followers: newFollowers,
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [currentUser._id]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filter by Category
      if (selectedCategory === 'All') return true;

      const keywords = SKILL_CATEGORIES[selectedCategory];
      if (!keywords) return true;

      // Check if user has any skill matching the category keywords
      return user.skills?.some(skill => {
        if (!skill || typeof skill !== 'string') return false;
        const lowerSkill = skill.toLowerCase();
        return keywords.some(keyword => lowerSkill.includes(keyword));
      });
    });
  }, [users, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Search Users</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Find and connect with talented people</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow animated-spin-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by username, name, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:ring-2 transition-all duration-300"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex items-center space-x-2 h-full">
            <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-48 px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-sm"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="All">All Skills</option>
              {Object.keys(SKILL_CATEGORIES).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-white mb-4">Search Results</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 backdrop-blur-lg rounded-lg border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
                <User className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No users found</h3>
              <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
                {searchTerm || selectedCategory !== 'All'
                  ? 'Try adjusting your search criteria or filters'
                  : 'No users available at the moment'
                }
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                onMessage={handleMessage}
                onFollow={handleFollow}
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearch;