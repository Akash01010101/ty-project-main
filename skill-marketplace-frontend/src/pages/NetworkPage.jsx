import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import UserSearch from '../components/UserSearch';
import UserItem from '../components/UserItem';
import { getFollowing, getFollowers, followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const fetchFollowing = useCallback(async () => {
    try {
      const data = await getFollowing();
      setFollowingUsers(data);
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  }, []);

  const fetchFollowers = useCallback(async () => {
    try {
      const data = await getFollowers();
      setFollowers(data);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'following') {
      fetchFollowing();
    } else if (activeTab === 'followers') {
      fetchFollowers();
    }
  }, [activeTab, fetchFollowing, fetchFollowers]);

  const handleMessage = useCallback((user) => {
    navigate('/dashboard?tab=messages', { state: { recipientId: user._id, recipientName: user.name, recipientProfilePicture: user.profilePicture } });
  }, [navigate]);

  const handleFollow = useCallback(async (targetUser) => {
    try {
      await followUser(targetUser._id);
      fetchFollowing();
      fetchFollowers();
    } catch (error) {
      console.error('Error following user:', error);
    }
  }, [fetchFollowing, fetchFollowers]);

  return (
    <div className="space-y-6">
      <div className="border-b" style={{ borderColor: 'var(--border-color)'}}>
        <nav className="-mb-px flex gap-4 sm:gap-8 overflow-x-auto whitespace-nowrap no-scrollbar" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('search')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'search'
                ? 'border-[var(--text-accent)]'
                : 'border-transparent hover:border-[var(--border-color)]'
            }`}
            style={{ color: activeTab === 'search' ? 'var(--text-accent)' : 'var(--text-secondary)' }}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'following'
                ? 'border-[var(--text-accent)]'
                : 'border-transparent hover:border-[var(--border-color)]'
            }`}
            style={{ color: activeTab === 'following' ? 'var(--text-accent)' : 'var(--text-secondary)' }}
          >
            Following ({followingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'followers'
                ? 'border-[var(--text-accent)]'
                : 'border-transparent hover:border-[var(--border-color)]'
            }`}
            style={{ color: activeTab === 'followers' ? 'var(--text-accent)' : 'var(--text-secondary)' }}
          >
            Followers ({followers.length})
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'search' && <UserSearch />}
        {activeTab === 'following' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {followingUsers.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                onMessage={handleMessage}
                onFollow={handleFollow}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
        {activeTab === 'followers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {followers.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                onMessage={handleMessage}
                onFollow={handleFollow}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;