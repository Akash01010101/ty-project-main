import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, User, Home, Sparkles, Briefcase, BookOpen, MessageSquare, ShoppingCart, CreditCard, DollarSign, Search as SearchIcon, LogOut, Menu, X, Code, Palette, Video, Pen, TrendingUp } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileDropdownRef = useRef(null);
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
      case 'ai-picks': return 'AI Picks';
      case 'my-gigs': return 'My Gigs';
      case 'portfolio': return 'Portfolio';
      case 'messages': return 'Messages';
      case 'orders': return 'Orders';
      case 'my-purchases': return 'My Purchases';
      case 'wallet': return 'Wallet';
      case 'network': return 'Search Users';
      default: return 'Browse';
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
    if (activeTab === 'Browse' || activeTab === 'AI Picks') {
      fetchGigs();
    }
  }, [activeTab]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { id: 'All', label: 'All', icon: null },
    { id: 'Programming', label: 'Programming', icon: Code },
    { id: 'Design', label: 'Design', icon: Palette },
    { id: 'Video & Animation', label: 'Video & Animation', icon: Video },
    { id: 'Writing', label: 'Writing', icon: Pen },
    { id: 'Marketing', label: 'Marketing', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Header Navigation */}
      <nav className="border-b sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left - Logo */}
          <Link to="/dashboard" className="flex items-center shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-2" style={{ backgroundColor: 'var(--button-action)' }}>
              <span className="text-white font-bold text-xl">🍀</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Peerly</h1>
          </Link>

          {/* Center - Desktop Navigation Links */}
          <div className="hidden lg:flex flex-1 justify-center min-w-0">
            <div className="flex items-center space-x-1 overflow-x-auto whitespace-nowrap no-scrollbar">
              {[
                { name: 'Browse', tab: 'browse' },
                { name: 'AI Picks', tab: 'ai-picks' },
                { name: 'My Gigs', tab: 'my-gigs' },
                { name: 'Messages', tab: 'messages', badge: unreadCount },
                { name: 'Orders', tab: 'orders' },
                { name: 'My Purchases', tab: 'my-purchases' },
                { name: 'Wallet', tab: 'wallet' },
                { name: 'Search Users', tab: 'network' },
                { name: 'Portfolio', tab: 'portfolio' },
              ].map((item) => (
                <button
                  key={item.tab}
                  onClick={() => navigate(`/dashboard?tab=${item.tab}`)}
                  className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: activeTab === item.name ? 'var(--bg-primary)' : 'transparent',
                    color: activeTab === item.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {item.name}
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right - Theme Toggle, Mobile Menu, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md transition-all duration-200"
              style={{ backgroundColor: 'var(--button-secondary)' }}
            >
              {sidebarOpen ? <X size={20} style={{ color: 'var(--text-primary)' }} /> : <Menu size={20} style={{ color: 'var(--text-primary)' }} />}
            </button>
          
            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full overflow-hidden transition-all duration-200 hover:ring-2 flex-shrink-0"
                style={{ border: '2px solid var(--button-action)', ringColor: 'var(--button-action)' }}
              >
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
                    <User size={18} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                )}
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden z-50"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    {/* Profile Header */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: '2px solid var(--button-action)' }}>
                          {user?.profilePicture ? (
                            <img 
                              src={user.profilePicture.startsWith('http') 
                                ? user.profilePicture 
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
                              alt="User Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
                              <User size={32} style={{ color: 'var(--text-secondary)' }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.university || 'State University'}</p>
                        </div>
                      </div>
                      
                      {/* Rating & Stats */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#facc15" />
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.rating}/5.0</span>
                          <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>({profileStats.totalGigs} gigs)</span>
                        </div>
                      </div>

                      {/* Experience & Education Details */}
                      {(user?.experience?.length > 0 || user?.education?.length > 0) && (
                        <div className="mb-3 space-y-2 border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                          {user.experience?.map((exp, i) => (
                            <div key={`exp-${i}`} className="flex items-start text-xs">
                              <Briefcase size={12} className="mr-2 mt-0.5 shrink-0" style={{ color: 'var(--text-accent)' }} />
                              <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{exp.title}</p>
                                <p style={{ color: 'var(--text-secondary)' }}>{exp.company}</p>
                              </div>
                            </div>
                          ))}
                          {user.education?.map((edu, i) => (
                            <div key={`edu-${i}`} className="flex items-start text-xs">
                              <BookOpen size={12} className="mr-2 mt-0.5 shrink-0" style={{ color: 'var(--text-accent)' }} />
                              <div>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{edu.degree}</p>
                                <p style={{ color: 'var(--text-secondary)' }}>{edu.school}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {user?.skills && user.skills.length > 0 && (
                        <div>
                          <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {user.skills.slice(0, 4).map((skill, index) => (
                              <span key={index} className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}>
                                {skill}
                              </span>
                            ))}
                            {user.skills.length > 4 && (
                              <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                                +{user.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile Actions */}
                    <div className="p-2">
                      <Link to="/edit-profile" onClick={() => setProfileDropdownOpen(false)}>
                        <button className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 hover:bg-[var(--bg-primary)]" style={{ color: 'var(--text-primary)' }}>
                          <User size={16} className="inline mr-2" />
                          Edit Profile
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          navigate('/dashboard?tab=wallet');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 hover:bg-[var(--bg-primary)]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <CreditCard size={16} className="inline mr-2" />
                        Wallet
                      </button>
                      <button 
                        onClick={logout}
                        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 hover:bg-red-500/10"
                        style={{ color: '#ef4444' }}
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 overflow-y-auto lg:hidden"
              style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Menu</h2>
                  <button onClick={() => setSidebarOpen(false)} className="p-2">
                    <X size={24} style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
                
                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  {[
                    { name: 'Browse', tab: 'browse' },
                    { name: 'AI Picks', tab: 'ai-picks' },
                    { name: 'My Gigs', tab: 'my-gigs' },
                    { name: 'Messages', tab: 'messages', badge: unreadCount },
                    { name: 'Orders', tab: 'orders' },
                    { name: 'My Purchases', tab: 'my-purchases' },
                    { name: 'Wallet', tab: 'wallet' },
                    { name: 'Search Users', tab: 'network' },
                    { name: 'Portfolio', tab: 'portfolio' },
                  ].map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => {
                        navigate(`/dashboard?tab=${item.tab}`);
                        setSidebarOpen(false);
                      }}
                      className="relative w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-200"
                      style={{
                        backgroundColor: activeTab === item.name ? 'var(--bg-primary)' : 'transparent',
                        color: activeTab === item.name ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {item.name}
                      {item.badge > 0 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {/* Browse / AI Picks Page */}
          {(activeTab === 'Browse' || activeTab === 'AI Picks') && (
            <>
              {/* Hero Section */}
              <div className="mb-8 text-center">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 tracking-tighter drop-shadow-2xl text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-white dark:to-white/30" style={{ lineHeight: '1.05' }}>
                  Discover Talent.
                </h1>
                <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Curated student freelance services. Connect with the next generation of industry leaders today.
                </p>
              </div>

              {/* Search Bar */}
              <div className="mb-6 max-w-3xl mx-auto">
                <div className="animated-spin-border animated-spin-border-pill">
                  <div className="relative z-10 flex items-center gap-3 px-4 py-2">
                    <SearchIcon size={20} style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      placeholder="Search for 'App Design'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 min-w-0 py-2 text-sm focus:outline-none"
                      style={{ color: 'var(--text-primary)' }}
                    />
                    <button
                      type="button"
                      className="shrink-0 px-6 py-2 rounded-full font-medium transition-all duration-200 hover:opacity-90"
                      style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="mb-8 flex flex-wrap gap-2 justify-center">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                      style={{
                        backgroundColor: selectedCategory === category.id ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                        color: selectedCategory === category.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: `1px solid ${selectedCategory === category.id ? 'var(--button-action)' : 'var(--border-color)'}`,
                      }}
                    >
                      {IconComponent && <IconComponent size={16} />}
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Gigs Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="rounded-xl p-5 animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="h-32 rounded-lg mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                      <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                      <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--bg-accent)' }}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {gigs.map((gig, index) => (
                    <motion.div
                      key={gig._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {/* User Info Header */}
                      <div className="p-4 flex items-center space-x-3">
                        <div className="relative">
                          {gig.user?.profilePicture ? (
                            <img
                              src={gig.user.profilePicture.startsWith('http')
                                ? gig.user.profilePicture
                                : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${gig.user.profilePicture}`}
                              alt={gig.user?.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
                              <User size={20} style={{ color: 'var(--text-secondary)' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {gig.user?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {gig.user?.university || gig.category || 'DESIGN'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>From</p>
                          <p className="text-sm font-bold" style={{ color: 'var(--button-action)' }}>
                            ${gig.price}
                          </p>
                        </div>
                      </div>

                      {/* Gig Content */}
                      <div className="px-4 pb-4">
                        <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-[var(--button-action)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                          {gig.title}
                        </h3>
                        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {gig.description}
                        </p>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {gig.skills?.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-xs font-medium"
                              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Rating & Reviews */}
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" fill="#facc15" />
                          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {gig.rating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            ({gig.reviews || 0})
                          </span>
                        </div>

                        {/* Contact Button */}
                        {(() => {
                          const target = gig.user || gig.creator;
                          const recipientId = target?._id;
                          const isSelf = recipientId && user?._id && recipientId === user._id;
                          if (!recipientId || isSelf) return null;
                          return (
                            <button
                              onClick={() =>
                                navigate('/dashboard?tab=messages', {
                                  state: {
                                    recipientId,
                                    recipientName: target?.name,
                                    recipientProfilePicture: target?.profilePicture,
                                  },
                                })
                              }
                              className="mt-3 w-full px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90"
                              style={{ backgroundColor: 'var(--button-action)', color: 'white' }}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">Contact</span>
                            </button>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {!loading && gigs.length > 0 && (
                <div className="mt-12 text-center">
                  <button
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  >
                    Load More Gigs ↓
                  </button>
                </div>
              )}
            </>
          )}

          {/* Other Tabs */}
          {activeTab === 'My Gigs' && <MyGigs />}
          {activeTab === 'Portfolio' && <Portfolio />}
          {activeTab === 'Messages' && <Messages />}
          {activeTab === 'Orders' && <Orders />}
          {activeTab === 'My Purchases' && <MyPurchases />}
          {activeTab === 'Wallet' && <WalletPage />}
          {activeTab === 'Search Users' && <NetworkPage />}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t text-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            © 2025 Peerly Inc. Student Freelance Marketplace.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link to="/terms" style={{ color: 'var(--text-secondary)' }} className="hover:underline">Terms</Link>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)' }} className="hover:underline">Privacy</Link>
           
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardPage;
