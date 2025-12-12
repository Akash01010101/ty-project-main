import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, MapPin, Star, MessageCircle, UserPlus, Filter } from 'lucide-react';
import { searchUsers } from '../api/dashboard';
import { followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import UserItem from './UserItem';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim() === '') {
        setUsers([]);
        return;
      }

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

  const skillOptions = useMemo(() => {
    const allSkills = users.flatMap(user => user.skills || []);
    return ['all', ...new Set(allSkills)];
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSkill = selectedSkill === 'all' || 
        user.skills.some(skill => skill.toLowerCase().includes(selectedSkill.toLowerCase()));
      
      return matchesSkill;
    });
  }, [users, selectedSkill]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Search Users</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Find and connect with talented people</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1 animated-spin-border">
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
        <div className="md:col-span-1">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Skills</option>
              {skillOptions.slice(1).map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
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
                {searchTerm || selectedSkill !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Start searching to find talented people to connect with'
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