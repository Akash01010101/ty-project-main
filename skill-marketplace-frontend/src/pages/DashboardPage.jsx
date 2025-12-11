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
            {activeTab === 'Browse Gigs' && (
              <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex-1 max-w-2xl">
                  <input
                    type="text"
                    placeholder="Search gigs, skills, or keywords..."
                    className="w-full px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2"
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
                  <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Gigs</h2>
                  {loading ? <div className="text-center py-8" style={{ color: 'var(--text-primary)' }}>Loading...</div> : (
                    <div className="space-y-4">
                      {gigs.map((gig) => (
                        <motion.div
                          key={gig._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="glow-border rounded-lg p-5 transition-all duration-300 hover:shadow-md"
                          style={{
                            backgroundColor: 'var(--bg-secondary)'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {gig.user?.profilePicture ? (
                                <img
                                  src={gig.user.profilePicture.startsWith('http')
                                    ? gig.user.profilePicture
                                    : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${gig.user.profilePicture}`}
                                  alt={gig.user?.name || 'User'}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
                                  <User size={24} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{gig.title}</h3>
                                <div className="flex items-center space-x-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                                  <span>{gig.user?.name || 'Anonymous'}</span>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3" />
                                  <span>Unknown</span>
                                  <span>•</span>
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span>{gig.rating.toFixed(1)} ({gig.reviews} reviews)</span>
                                </div>
                                <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {gig.skills?.slice(0, 5).map((skill, index) => (
                                    <span key={index} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}>
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="text-right ml-4 flex-shrink-0">
                              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--button-action)' }}>${gig.price}</div>
                              <div className="text-xs flex items-center justify-end mb-3" style={{ color: 'var(--text-secondary)' }}>
                                <Clock className="w-3 h-3 mr-1" />
                                {gig.duration}
                              </div>
                              <div className="flex flex-col space-y-2">
                                <button className="px-4 py-2 rounded-md text-xs border transition-all duration-200" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }} onClick={() => {
                                  setActiveTab('Messages');
                                  navigate('/dashboard?tab=messages', { state: { recipientId: gig.user._id, recipientName: gig.user.name, recipientProfilePicture: gig.user.profilePicture } });
                                }}>
                                  Contact
                                </button>
                              </div>
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