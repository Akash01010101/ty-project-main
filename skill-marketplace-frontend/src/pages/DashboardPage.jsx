import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, User, Home, Sparkles, Briefcase, BookOpen, MessageSquare, ShoppingCart, CreditCard, DollarSign, Search as SearchIcon, LogOut } from 'lucide-react';
import MyGigs from '../components/MyGigs';
import Portfolio from '../components/Portfolio';
import Messages from '../components/Messages';
import Orders from '../components/Orders';
import MyPurchases from '../components/MyPurchases';
import NetworkPage from './NetworkPage';
import WalletPage from './WalletPage';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getGigs } from '../api/dashboard';

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, unreadCount } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [profileStats, setProfileStats] = useState({
    rating: 0,
    totalGigs: 0,
    skills: [],
    profileStrength: 0,
    marketDemand: 0,
    activeOrders: 0,
    portfolioItems: 0,
    thisMonth: 0,
    responseRate: 0,
  });

  const activeTab = useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    switch (tab) {
      case 'my-gigs': return 'My Gigs';
      case 'portfolio': return 'Portfolio';
      case 'messages': return 'Messages';
      case 'orders': return 'Orders';
      case 'my-purchases': return 'My Purchases';
      case 'wallet': return 'Wallet';
      case 'network': return 'Network';
      default: return 'Browse Gigs';
    }
  }, [location.search]);

  const setActiveTab = (tab) => {
    const tabUrl = tab.toLowerCase().replace(/\s+/g, '-');
    navigate(`/dashboard?tab=${tabUrl}`);
  };

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const data = await getGigs();
        setGigs(data);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === 'Browse Gigs') {
      fetchGigs();
    }
  }, [activeTab]);

  const categories = ['All Categories', 'React Development', 'Math Tutoring', 'Video Editing', 'Graphic Design', 'Data Science', 'Writing'];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <h1 className="text-3xl font-bold pl-20" style={{ color: 'var(--text-primary)' }}>Peerly</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '2px solid var(--button-action)' }}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') 
                    ? user.profilePicture 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <User size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.university || 'State University'}</p>
            </div>
          </div>
          <ThemeToggle />
          <button 
            onClick={logout}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            style={{ 
              backgroundColor: 'var(--button-secondary)', 
              color: 'var(--text-secondary)' 
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex">
            <nav className="w-48 p-4 border-r" style={{ borderColor: 'var(--border-color)' }}>
              <div className="space-y-1">
                {['Browse Gigs', 'AI Picks', 'My Gigs', 'Portfolio', 'Messages', 'Orders', 'My Purchases', 'Wallet', 'Network'].map(tabName => (
                  <button
                    key={tabName}
                    onClick={() => setActiveTab(tabName)}
                    className={`w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === tabName ? 'font-medium glow-border-static' : 'hover:bg-[var(--button-secondary)]'}`}
                    style={{
                      backgroundColor: activeTab === tabName ? 'var(--bg-primary)' : 'transparent',
                      color: activeTab === tabName ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {tabName === 'Browse Gigs' && <Home size={18} />}
                      {tabName === 'AI Picks' && <Sparkles size={18} />}
                      {tabName === 'My Gigs' && <Briefcase size={18} />}
                      {tabName === 'Portfolio' && <BookOpen size={18} />}
                      {tabName === 'Messages' && <MessageSquare size={18} />}
                      {tabName === 'Orders' && <ShoppingCart size={18} />}
                      {tabName === 'My Purchases' && <CreditCard size={18} />}
                      {tabName === 'Wallet' && <CreditCard size={18} />}
                      {tabName === 'Network' && <SearchIcon size={18} />}
                      <span>{tabName}</span>
                    </div>
                    {tabName === 'Messages' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
            {/* Profile & Stats Column */}
            <div className="w-64 p-4 space-y-4">
              <div className="glow-border rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Profile</h3>
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.rating}/5.0</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>({profileStats.totalGigs} gigs)</span>
                </div>
                <div className="mb-4">
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {user?.skills && user.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to="/edit-profile">
                  <button className="w-full py-2 rounded-md text-sm font-medium transition-all duration-200" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}>
                    Edit Profile
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden border-none">
          <div className="flex-1 flex flex-col overflow-hidden">
            {(activeTab === 'Browse Gigs' || activeTab === 'AI Picks') && (
              <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex-1 max-w-2xl animated-spin-border">
                  <input
                    type="text"
                    placeholder="Search gigs, skills, or keywords..."
                    className="w-full px-4 py-2.5 rounded-[10px] text-sm focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: 'none'
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2.5 rounded-md text-sm focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: 'none'
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-auto p-6 border-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
              {activeTab === 'My Gigs' && <MyGigs />}
              {activeTab === 'Portfolio' && <Portfolio />}
              {activeTab === 'Messages' && <Messages />}
              {activeTab === 'Orders' && <Orders />}
              {activeTab === 'My Purchases' && <MyPurchases />}
              {activeTab === 'Wallet' && <WalletPage />}
              {activeTab === 'Network' && <NetworkPage />}
              {activeTab === 'Browse Gigs' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Discover Gigs</h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{gigs.length} services available</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <div className="h-32 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                          <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                          <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {gigs.map((gig, index) => (
                        <motion.div
                          key={gig._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -5 }}
                          className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {/* Gradient Header Banner */}
                          <div 
                            className="h-28 relative overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, var(--glow-color-1) 0%, var(--glow-color-2) 50%, var(--glow-color-3) 100%)`
                            }}
                          >
                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-30">
                              <div className="absolute top-0 left-0 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }}></div>
                              <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}></div>
                              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', transform: 'translate(-50%, -50%)' }}></div>
                            </div>
                            {/* Mesh Grid Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ 
                              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                              backgroundSize: '20px 20px'
                            }}></div>
                            {/* Price Badge */}
                            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-md shadow-lg" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                              ${gig.price}
                            </div>
                            {/* Duration Badge */}
                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-medium backdrop-blur-md flex items-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                              <Clock className="w-3 h-3 mr-1" />
                              {gig.duration}
                            </div>
                            {/* Skills at bottom */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                                {gig.skills?.slice(0, 3).map((skill, idx) => (
                                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md shadow-sm" style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                                    {skill}
                                  </span>
                                ))}
                              </div>
                              {gig.skills?.length > 3 && (
                                <span className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                                  +{gig.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5">
                            {/* User Info */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="relative">
                                {gig.user?.profilePicture ? (
                                  <img
                                    src={gig.user.profilePicture.startsWith('http')
                                      ? gig.user.profilePicture
                                      : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${gig.user.profilePicture}`}
                                    alt={gig.user?.name || 'User'}
                                    className="w-11 h-11 rounded-full object-cover"
                                    style={{ border: '1.5px solid var(--glow-color-1)' }}
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)', border: '1.5px solid var(--glow-color-1)' }}>
                                    <User size={20} style={{ color: 'var(--text-secondary)' }} />
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--button-action)' }}>
                                  <Star className="w-2.5 h-2.5 text-white" fill="white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{gig.user?.name || 'Anonymous'}</p>
                                <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-400 mr-0.5" fill="#facc15" />
                                    <span className="font-medium">{gig.rating.toFixed(1)}</span>
                                  </div>
                                  <span>•</span>
                                  <span>{gig.reviews} reviews</span>
                                </div>
                              </div>
                            </div>

                            {/* Gig Title & Description */}
                            <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-[var(--button-action)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                              {gig.title}
                            </h3>
                            <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
                              {gig.description}
                            </p>

                            {/* Price & CTA */}
                            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                              <div>
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Starting at</span>
                                <p className="text-xl font-bold" style={{ color: 'var(--button-action)' }}>${gig.price}</p>
                              </div>
                              <button 
                                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 hover:scale-105"
                                style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}
                                onClick={() => {
                                  setActiveTab('Messages');
                                  navigate('/dashboard?tab=messages', { state: { recipientId: gig.user._id, recipientName: gig.user.name, recipientProfilePicture: gig.user.profilePicture } });
                                }}
                              >
                                Contact
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;