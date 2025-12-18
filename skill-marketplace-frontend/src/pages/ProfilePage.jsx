import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageCircle, UserPlus, FileText } from 'lucide-react';
import { getUserProfile, followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// Define the worker src. We use the CDN to likely avoid vite transform issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CanvasPdfViewer = ({ url }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const renderPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (!active) return;

        const page = await pdf.getPage(1);

        if (!active) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF:', err);
        if (active) setError(err.message);
        setLoading(false);
      }
    };

    if (url) {
      renderPdf();
    }

    return () => { active = false; };
  }, [url]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
        <FileText size={48} className="mb-3 opacity-50" />
        <p className="text-center mb-4">Could not render PDF preview.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--button-action)', color: 'white' }}
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-gray-900 overflow-auto max-h-[600px] p-4 relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--button-action)' }}></div>
        </div>
      )}
      <canvas ref={canvasRef} className="shadow-lg max-w-full h-auto" />
    </div>
  );
};

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
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-5 sm:p-8 border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <img
              src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
              alt={user.name}
              className="w-32 h-32 rounded-full object-cover ring-4"
              style={{ ringColor: 'var(--button-action)' }}
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
              <div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-3 sm:gap-4 w-full">
                <button
                  onClick={handleMessage}
                  className="w-full sm:w-auto px-6 py-2 border rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  style={{ color: 'var(--text-accent)', borderColor: 'var(--border-color)' }}
                >
                  <MessageCircle size={20} />
                  <span>Message</span>
                </button>
                {currentUser._id !== user._id && (
                  <button
                    onClick={handleFollow}
                    className="w-full sm:w-auto px-6 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
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

        {user.resume && (() => {
          const resumeUrl = user.resume.startsWith('http')
            ? user.resume
            : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.resume.replace(/\\/g, '/')}`;
          const isPdf = user.resume.toLowerCase().endsWith('.pdf');
          const isImage = user.resume.match(/\.(jpg|jpeg|png|webp)$/i);
          const fileName = user.resume.split(/[/\\]/).pop();

          return (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-4">Resume</h3>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-5 sm:p-6 border border-white/10">

                {/* Header with filename and download button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)' }}>
                      <FileText size={20} style={{ color: 'var(--button-action)' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium truncate max-w-[200px] sm:max-w-[300px]">{fileName}</p>
                      <p className="text-gray-400 text-xs">{isPdf ? 'PDF Document' : isImage ? 'Image' : 'Document'}</p>
                    </div>
                  </div>
                  <a
                    href={resumeUrl}
                    download={fileName}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
                    style={{ backgroundColor: 'var(--button-action)', color: 'white' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download
                  </a>
                </div>

                {/* Preview Area */}
                <div className="w-full rounded-lg overflow-hidden border border-white/10 bg-gray-900">
                  {isPdf ? (
                    <CanvasPdfViewer url={resumeUrl} />
                  ) : isImage ? (
                    <img
                      src={resumeUrl}
                      alt="Resume Preview"
                      className="w-full h-auto max-h-[600px] object-contain bg-black/20"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                      <FileText size={48} className="mb-2 opacity-50" />
                      <p>Preview not available for this file type</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {gigs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Gigs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gigs.map(gig => (
                <div key={gig._id} className="bg-white/5 backdrop-blur-lg rounded-lg p-5 sm:p-6 border border-white/10">
                  <h4 className="font-bold text-lg text-white">{gig.title}</h4>
                  <p className="text-gray-400 mt-2">{gig.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg" style={{ color: 'var(--button-action)' }}>${gig.price}</span>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-5 h-5 mr-1" />
                      <span>{gig.rating.toFixed(1)} ({gig.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-4">Reviews</h3>
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review._id} className="bg-white/5 backdrop-blur-lg rounded-lg p-5 sm:p-6 border border-white/10">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.fromUser?.profilePicture
                        ? (review.fromUser.profilePicture.startsWith('http')
                          ? review.fromUser.profilePicture
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${review.fromUser.profilePicture}`)
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.fromUser?.name || 'User')}&background=random`}
                      alt={review.fromUser?.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.fromUser?.name || 'User')}&background=random`;
                      }}
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
        )}
      </div>
    </div >
  );
};

export default ProfilePage;
