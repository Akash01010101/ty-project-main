import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageCircle, UserPlus } from 'lucide-react';
import { getUserProfile, followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Fetching profile for ID:', id);
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(id);
        setProfile({
          ...data,
          isFollowing: data.user.followers.includes(currentUser._id),
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser._id]);

  const handleFollow = async () => {
    try {
      await followUser(id);
      setProfile(prevProfile => ({
        ...prevProfile,
        isFollowing: !prevProfile.isFollowing,
        user: {
          ...prevProfile.user,
          followers: prevProfile.isFollowing
            ? prevProfile.user.followers.filter(userId => userId !== currentUser._id)
            : [...prevProfile.user.followers, currentUser._id],
        },
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleMessage = () => {
    navigate('/dashboard?tab=messages', { 
      state: { 
        recipientId: profile.user._id, 
        recipientName: profile.user.name, 
        recipientProfilePicture: profile.user.profilePicture 
      } 
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">User not found.</div>;
  }

  const { user, gigs, reviews, isFollowing } = profile;

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <img
              src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover ring-4"
              style={{ ringColor: 'var(--button-action)'}}
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-white">{user.name}</h2>
              <p className="text-lg text-gray-400">@{user.name}</p>
              <div className="flex justify-center sm:justify-start items-center space-x-4 mt-4">
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 mr-1" />
                  <span className="font-bold">{user.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">•</span>
                <p className="text-gray-400">{user.followers.length} Followers</p>
                <span className="text-gray-500">•</span>
                <p className="text-gray-400">{user.following.length} Following</p>
              </div>
              <div className="mt-6 flex justify-center sm:justify-start space-x-4">
                <button
                  onClick={handleMessage}
                  className="px-6 py-2 border rounded-lg flex items-center space-x-2 transition-colors"
                  style={{ color: 'var(--text-accent)', borderColor: 'var(--border-color)'}}
                >
                  <MessageCircle size={20} />
                  <span>Message</span>
                </button>
                {currentUser._id !== user._id && (
                  <button
                    onClick={handleFollow}
                    className="px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    style={{ 
                      backgroundColor: isFollowing ? 'transparent' : 'var(--button-action)',
                      color: isFollowing ? 'var(--text-accent)' : 'white',
                      border: isFollowing ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    <UserPlus size={20} />
                    <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-4">Gigs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gigs.map(gig => (
              <div key={gig._id} className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <h4 className="font-bold text-lg text-white">{gig.title}</h4>
                <p className="text-gray-400 mt-2">{gig.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg" style={{ color: 'var(--button-action)'}}>${gig.price}</span>
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-5 h-5 mr-1" />
                    <span>{gig.rating.toFixed(1)} ({gig.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-4">Reviews</h3>
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="flex items-start space-x-4">
                  <img
                    src={review.fromUser.profilePicture.startsWith('http') ? review.fromUser.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${review.fromUser.profilePicture}`}
                    alt={review.fromUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white">{review.fromUser.name}</h4>
                      <div className="flex items-center text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                        {[...Array(5 - review.rating)].map((_, i) => <Star key={i} size={16} />)}
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
