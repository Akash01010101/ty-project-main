import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, MessageCircle, UserPlus, MapPin, User } from 'lucide-react';

const UserItem = ({ user, onMessage, onFollow, currentUser }) => {
  const isFollowing = useMemo(() => user.followers.includes(currentUser._id), [user.followers, currentUser._id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border flex flex-col p-4 sm:p-6 rounded-lg backdrop-blur-lg hover:shadow-md transition-all duration-200"
      style={{
        backgroundColor: 'var(--bg-secondary)'
      }}
    >
      <Link to={`/profile/${user._id}`} className="flex-grow">
        <div className="flex items-start space-x-4 mb-4">
          {user.profilePicture ? (
            <img
              src={user.profilePicture.startsWith('http')
                ? user.profilePicture
                : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
              alt={user.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-2 flex-shrink-0"
              style={{ ringColor: 'var(--button-secondary)' }}
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ring-2 flex-shrink-0" style={{ backgroundColor: 'var(--bg-secondary)', ringColor: 'var(--button-secondary)' }}>
              <User size={24} style={{ color: 'var(--text-secondary)' }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
              <div className="mb-2 sm:mb-0">
                <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </h3>
                <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>@{user.name}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1" />
                  <span className="text-sm">{user.rating?.toFixed(1) || 0}</span>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({user.followers.length} followers)</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              <MapPin className="w-4 h-4 mr-1" />
              <span>{user.university || 'University'}</span>
            </div>
            
            <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
              {user.bio || 'No bio available'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {user.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-accent)' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => onMessage(user)}
          className="flex-1 sm:flex-none px-4 py-2 border rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          style={{ 
            color: 'var(--text-secondary)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Message</span>
        </button>
        {currentUser._id !== user._id && (
          <button
            onClick={() => onFollow(user)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 ${isFollowing ? 'border' : ''}`}
            style={{ 
              backgroundColor: isFollowing ? 'transparent' : 'var(--button-primary)', 
              color: isFollowing ? 'var(--text-secondary)' : 'var(--bg-primary)',
              borderColor: isFollowing ? 'var(--border-color)' : 'transparent',
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default UserItem;
