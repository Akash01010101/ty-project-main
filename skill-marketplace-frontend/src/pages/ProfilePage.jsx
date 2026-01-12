import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MessageCircle, UserPlus, FileText, MapPin, 
  Calendar, Briefcase, GraduationCap, CheckCircle, 
  UserCheck, Download, ExternalLink, Mail, LayoutGrid, List
} from 'lucide-react';
import { getUserProfile, followUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const onResize = new ResizeObserver((entries) => {
    if (!entries || entries.length === 0) return;
    setContainerWidth(entries[0].contentRect.width);
  });

  useEffect(() => {
    if (containerRef.current) {
      onResize.observe(containerRef.current);
    }
    return () => onResize.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full flex flex-col items-center bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border-color)] relative shadow-lg group"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-[300px] w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--button-action)]"></div>
          </div>
        }
        error={
          <div className="flex flex-col items-center justify-center h-[300px] text-[var(--text-secondary)] p-6">
            <FileText size={48} className="mb-3 opacity-50" />
            <p className="text-center mb-4 text-sm">Preview unavailable.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 bg-[var(--button-action)] text-white"
            >
              Download PDF
            </a>
          </div>
        }
        className="flex flex-col items-center w-full"
      >
        <Page 
          pageNumber={1} 
          width={containerWidth ? Math.min(containerWidth, 600) : undefined}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="shadow-xl my-4 transition-transform duration-300"
        />
      </Document>
      
      {!loading && numPages && (
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          1 / {numPages}
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(id);
        setProfile({
          ...data,
          isFollowing: data.user.followers.includes(currentUser?._id),
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id && currentUser) {
      fetchProfile();
    }
  }, [id, currentUser?._id]);

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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: 'var(--button-action)', borderTopColor: 'transparent' }}></div>
          <p className="font-medium animate-pulse" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>User not found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>The profile you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 rounded-lg bg-[var(--button-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { user, gigs, reviews, isFollowing } = profile;

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';
    return `${apiUrl}/${profilePicture.replace(/\\/g, '/')}`;
  };

  const profilePicUrl = getProfilePictureUrl(user.profilePicture) || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=256`;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'gigs', label: `Gigs (${gigs.length})`, icon: Briefcase },
    { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar - Profile Card */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden"
            >
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative mb-6 group"
                >
                  <div className="w-36 h-36 md:w-40 md:h-40 rounded-full p-1 bg-[var(--bg-secondary)] shadow-2xl">
                    <img
                      src={profilePicUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover border-4 border-[var(--bg-secondary)] bg-[var(--bg-primary)]"
                    />
                  </div>
                  {/* Online Indicator could go here */}
                </motion.div>

                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">{user.name}</h1>
                <p className="text-[var(--text-secondary)] font-medium mb-4 flex items-center gap-1">
                  @{user.username || user.email?.split('@')[0]}
                  {user.university && <span className="mx-2">•</span>}
                  {user.university}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 w-full py-6 border-t border-b border-[var(--border-color)] mb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">{user.rating?.toFixed(1) || '0.0'}</span>
                    <div className="flex items-center text-yellow-400 text-xs mt-1">
                      <Star size={12} fill="currentColor" />
                      <span className="ml-1 text-[var(--text-secondary)]">Rating</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center border-l border-r border-[var(--border-color)] px-2">
                    <span className="text-lg font-bold text-[var(--text-primary)]">{user.followers?.length || 0}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wide">Followers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-[var(--text-primary)]">{user.following?.length || 0}</span>
                    <span className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wide">Following</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleMessage}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Message
                  </button>
                  {currentUser?._id !== user._id && (
                    <button
                      onClick={handleFollow}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                        isFollowing 
                          ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)]' 
                          : 'bg-[var(--button-action)] text-white'
                      }`}
                    >
                      {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Skills Card */}
            {user.skills && user.skills.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-[var(--border-color)] p-6"
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Star size={18} className="text-[var(--button-action)]" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resume Card (Small) */}
            {user.resume && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[var(--bg-secondary)] rounded-2xl shadow-lg border border-[var(--border-color)] p-6"
              >
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-[var(--button-action)]" /> Resume
                </h3>
                
                {(() => {
                  const resumeUrlRaw = user.resume.startsWith('http')
                    ? user.resume
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.resume.replace(/\\/g, '/')}`;
                  const resumeUrl = encodeURI(resumeUrlRaw);
                  const fileName = user.resume.split(/[/\\]/).pop();
                  
                  return (
                    <a 
                      href={resumeUrl}
                      download={fileName}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--button-action)] transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-[var(--button-action)]/10 text-[var(--button-action)]">
                        <Download size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{fileName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">Click to view</p>
                      </div>
                      <ExternalLink size={16} className="text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                })()}
              </motion.div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="lg:w-2/3 space-y-8 mt-4 lg:mt-0">
            
            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] mb-6 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                    activeTab === tab.id
                      ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Bio */}
                  {user.bio && (
                    <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-color)]">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">About Me</h3>
                      <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {user.experience && user.experience.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <Briefcase className="text-[var(--button-action)]" /> Experience
                      </h3>
                      <div className="space-y-4">
                        {user.experience.map((exp, index) => (
                          <div key={index} className="flex gap-4 relative">
                            {/* Timeline Line */}
                            {index !== user.experience.length - 1 && (
                              <div className="absolute left-[19px] top-10 bottom-[-16px] w-[2px] bg-[var(--border-color)]"></div>
                            )}
                            
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 z-10">
                              <Briefcase size={18} className="text-[var(--text-secondary)]" />
                            </div>
                            
                            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] hover:border-[var(--button-action)] transition-colors">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-[var(--text-primary)] text-lg">{exp.title}</h4>
                                  <p className="text-[var(--button-action)] font-medium">{exp.company}</p>
                                </div>
                                <div className="flex items-center text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-3 py-1 rounded-full mt-2 sm:mt-0 w-fit">
                                  <Calendar size={12} className="mr-1.5" />
                                  {new Date(exp.from).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                                  {exp.current || !exp.to ? ' Present' : ` ${new Date(exp.to).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                                </div>
                              </div>
                              {exp.description && <p className="text-[var(--text-secondary)] text-sm mt-2">{exp.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {user.education && user.education.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <GraduationCap className="text-[var(--button-action)]" /> Education
                      </h3>
                      <div className="space-y-4">
                        {user.education.map((edu, index) => (
                          <div key={index} className="flex gap-4 relative">
                            {/* Timeline Line */}
                            {index !== user.education.length - 1 && (
                              <div className="absolute left-[19px] top-10 bottom-[-16px] w-[2px] bg-[var(--border-color)]"></div>
                            )}
                            
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 z-10">
                              <GraduationCap size={18} className="text-[var(--text-secondary)]" />
                            </div>
                            
                            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)] hover:border-[var(--button-action)] transition-colors">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-[var(--text-primary)] text-lg">{edu.school}</h4>
                                  <p className="text-[var(--button-action)] font-medium">{edu.degree}{edu.fieldofstudy ? `, ${edu.fieldofstudy}` : ''}</p>
                                </div>
                                <div className="flex items-center text-xs text-[var(--text-secondary)] bg-[var(--bg-primary)] px-3 py-1 rounded-full mt-2 sm:mt-0 w-fit">
                                  <Calendar size={12} className="mr-1.5" />
                                  {new Date(edu.from).getFullYear()} - {edu.current || !edu.to ? 'Present' : new Date(edu.to).getFullYear()}
                                </div>
                              </div>
                              {edu.description && <p className="text-[var(--text-secondary)] text-sm mt-2">{edu.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume PDF Preview */}
                  {user.resume && user.resume.toLowerCase().endsWith('.pdf') && (
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FileText className="text-[var(--button-action)]" /> Resume Preview
                      </h3>
                      {(() => {
                        const resumeUrlRaw = user.resume.startsWith('http')
                          ? user.resume
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.resume.replace(/\\/g, '/')}`;
                        const resumeUrl = encodeURI(resumeUrlRaw);
                        return <PdfViewer url={resumeUrl} />;
                      })()}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'gigs' && (
                <motion.div
                  key="gigs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {gigs.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                      <Briefcase size={48} className="mx-auto text-[var(--text-secondary)] opacity-50 mb-4" />
                      <p className="text-[var(--text-secondary)]">No gigs posted yet.</p>
                    </div>
                  ) : (
                    gigs.map(gig => (
                      <div 
                        key={gig._id} 
                        className="group bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-xl hover:border-[var(--button-action)] transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/gig/${gig._id}`)}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <span className="bg-[var(--bg-primary)] text-[var(--text-secondary)] text-xs font-bold px-2.5 py-1 rounded-full border border-[var(--border-color)]">
                              {gig.category || 'Service'}
                            </span>
                            <div className="flex items-center text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded-full">
                              <Star size={12} fill="currentColor" className="mr-1" />
                              {gig.rating.toFixed(1)}
                            </div>
                          </div>
                          <h4 className="font-bold text-lg text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--button-action)] transition-colors">
                            {gig.title}
                          </h4>
                          <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4">
                            {gig.description}
                          </p>
                          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                            <span className="text-[var(--text-secondary)] text-xs">Starting at</span>
                            <span className="font-bold text-xl text-[var(--text-primary)]">${gig.price}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                      <Star size={48} className="mx-auto text-[var(--text-secondary)] opacity-50 mb-4" />
                      <p className="text-[var(--text-secondary)]">No reviews yet.</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review._id} className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-color)]">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.fromUser?.profilePicture
                              ? (review.fromUser.profilePicture.startsWith('http')
                                ? review.fromUser.profilePicture
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${review.fromUser.profilePicture}`)
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.fromUser?.name || 'User')}&background=random`}
                            alt={review.fromUser?.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[var(--bg-primary)]"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.fromUser?.name || 'User')}&background=random`;
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-[var(--text-primary)]">{review.fromUser.name}</h4>
                              <span className="text-xs text-[var(--text-secondary)]">
                                {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < review.rating ? "currentColor" : "none"} 
                                  className={i < review.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} 
                                />
                              ))}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed bg-[var(--bg-primary)] p-3 rounded-xl">
                              "{review.comment}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProfilePage;
