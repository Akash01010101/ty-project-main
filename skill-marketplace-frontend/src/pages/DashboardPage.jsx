import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter, User, Home, Sparkles, Briefcase, BookOpen, MessageSquare, ShoppingCart, CreditCard, DollarSign, Search as SearchIcon, Settings, HelpCircle, LogOut } from 'lucide-react';
import MyGigs from '../components/MyGigs';
import Portfolio from '../components/Portfolio';
import Messages from '../components/Messages';
import Orders from '../components/Orders';
import MyPurchases from '../components/MyPurchases';
import ExpenseIncome from '../components/ExpenseIncome';
import UserSearch from '../components/UserSearch';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

import { authAPI } from '../api/auth';
import { getGigs, createOrder } from '../api/dashboard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('Browse Gigs');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
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
  
  // Logout handler
  const handleLogout = () => {
    try {
      logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Check URL parameters to set active tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab === 'my-gigs') {
      setActiveTab('My Gigs');
    } else if (tab === 'portfolio') {
      setActiveTab('Portfolio');
    } else if (tab === 'messages') {
      setActiveTab('Messages');
    } else if (tab === 'orders') {
      setActiveTab('Orders');
    } else if (tab === 'my-purchases') {
      setActiveTab('My Purchases');
    } else if (tab === 'expense-income') {
      setActiveTab('Expense and Income');
    } else if (tab === 'user-search') {
      setActiveTab('Search Users');
    }
  }, [location.search]);
  
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const data = await getGigs();
        setGigs(data);
      } catch (error) {
        console.error('Error fetching gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchQuickStats = async () => {
      try {
        const stats = await authAPI.getQuickStats();
        setProfileStats(stats);
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchGigs();
    fetchQuickStats();
  }, []);

  const handleOrderNow = async (gig) => {
    try {
      await createOrder({
        gigId: gig._id,
        sellerId: gig.user._id,
        price: gig.price,
      });
      alert('Order placed successfully!');
      navigate('/dashboard?tab=my-purchases');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order.');
    }
  };

  const categories = ['All Categories', 'React Development', 'Math Tutoring', 'Video Editing', 'Graphic Design', 'Data Science', 'Writing'];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        {/* Logo */}
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>SkillMarketPlace</h1>
        
        {/* User Profile and Controls */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '2px solid var(--button-action)' }}>
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') 
                    ? user.profilePicture 
                    : `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/${user.profilePicture}`}
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center" style="background-color: var(--bg-secondary)"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-secondary)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                  }}
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
            onClick={handleLogout}
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
        {/* Left Sidebar - Contains Navigation AND Profile/Stats side by side */}
        <div className="flex overflow-y-auto" style={{ backgroundColor: 'var(--bg-accent)' }}>
          <div className="flex">
            {/* Navigation Menu - Left Column */}
            <nav className="w-48 p-4 border-r" style={{ borderColor: 'var(--border-color)' }}>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('Browse Gigs')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Browse Gigs' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Browse Gigs' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Browse Gigs' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <Home size={18} />
                  <span>Browse Gigs</span>
                </button>

                <button
                  onClick={() => setActiveTab('AI Picks')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'AI Picks' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'AI Picks' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'AI Picks' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <Sparkles size={18} />
                  <span>AI Picks</span>
                </button>

                <button
                  onClick={() => setActiveTab('My Gigs')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'My Gigs' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'My Gigs' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'My Gigs' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <Briefcase size={18} />
                  <span>My Gigs</span>
                </button>

                <button
                  onClick={() => setActiveTab('Portfolio')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Portfolio' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Portfolio' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Portfolio' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <BookOpen size={18} />
                  <span>Portfolio</span>
                </button>

                <button
                  onClick={() => setActiveTab('Messages')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Messages' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Messages' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Messages' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                </button>

                <button
                  onClick={() => setActiveTab('Orders')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Orders' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Orders' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Orders' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('My Purchases')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'My Purchases' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'My Purchases' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'My Purchases' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <CreditCard size={18} />
                  <span>My Purchases</span>
                </button>

                <button
                  onClick={() => setActiveTab('Expense and Income')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Expense and Income' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Expense and Income' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Expense and Income' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <DollarSign size={18} />
                  <span>Expense and Income</span>
                </button>

                <button
                  onClick={() => setActiveTab('Search Users')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${activeTab === 'Search Users' ? 'font-medium' : ''}`}
                  style={{
                    backgroundColor: activeTab === 'Search Users' ? 'var(--button-secondary)' : 'transparent',
                    color: activeTab === 'Search Users' ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <SearchIcon size={18} />
                  <span>Search Users</span>
                </button>
              </div>
            </nav>

            {/* Profile & Stats Column - Right of Navigation */}
            <div className="w-64 p-4 space-y-4">
              {/* Your Profile Card */}
              <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Profile</h3>
                
                <div className="flex items-center justify-center mb-3">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.rating}/5.0</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>({profileStats.totalGigs} gigs)</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {profileStats.skills && profileStats.skills.slice(0, 3).map((skill, index) => (
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

              {/* Quick Stats Card with Vertical Bar Chart */}
              <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Stats</h4>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active Orders</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.activeOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Portfolio Items</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.portfolioItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>This Month</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--button-action)' }}>${profileStats.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{profileStats.responseRate}%</span>
                  </div>
                </div>

                {/* Vertical Bar Chart */}
                <div className="mt-4">
                  <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>This Month</p>
                  <div className="relative h-32 flex items-end justify-between gap-1">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 h-full flex flex-col justify-between text-xs" style={{ color: 'var(--text-secondary)', marginLeft: '-18px' }}>
                      <span>40</span>
                      <span>30</span>
                      <span>20</span>
                      <span>10</span>
                      <span>0</span>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 flex items-end justify-around gap-1 h-full ml-3">
                      {/*
                        Temporarily using static data for the bar graph. This should be replaced with dynamic data from the backend.
                      */}
                      {/*
                        { [
                          { month: 'Apr', value: 40 },
                          { month: 'May', value: 55 },
                          { month: 'Jun', value: 70 },
                          { month: 'Dec', value: 90 }
                        ].map((data, index) => (
                          <div key={data.month} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full rounded-t transition-all duration-500 hover:opacity-80" 
                              style={{ 
                                height: `${data.value}%`, 
                                backgroundColor: 'var(--button-action)' 
                              }}
                            ></div>
                            <span className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{data.month}</span>
                          </div>
                        )) }
                      */}
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '20%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Apr: 5`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Apr</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '35%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`May: 10`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>May</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '50%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Jun: 15`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Jun</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '65%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Jul: 20`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Jul</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '85%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Aug: 30`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Aug</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '95%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Sep: 35`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Sep</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-end h-full">
                        <div 
                          className="w-full rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer" 
                          style={{ 
                            height: '60%', 
                            backgroundColor: 'var(--button-action)',
                            minHeight: '8px'
                          }}
                          title={`Dec: 18`}
                        ></div>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Dec</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Bar and Filter - Only show for Browse Gigs */}
            {activeTab === 'Browse Gigs' && (
              <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
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

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
              {activeTab === 'My Gigs' ? (
                <MyGigs />
              ) : activeTab === 'Portfolio' ? (
                <Portfolio />
              ) : activeTab === 'Messages' ? (
                <Messages />
              ) : activeTab === 'Orders' ? (
                <Orders />
              ) : activeTab === 'My Purchases' ? (
                <MyPurchases />
              ) : activeTab === 'Expense and Income' ? (
                <ExpenseIncome />
              ) : activeTab === 'Search Users' ? (
                <UserSearch />
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Gigs</h2>
                  
                  {loading ? (
                    <div className="text-center py-8" style={{ color: 'var(--text-primary)' }}>Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {gigs.map((gig) => (
                        <motion.div
                          key={gig._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-lg p-5 transition-all duration-300 hover:shadow-md border"
                          style={{
                            backgroundColor: 'var(--bg-accent)',
                            borderColor: 'var(--border-color)'
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
                                  <span>{gig.user?.rating || 0} (0)</span>
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
                                <button className="px-4 py-2 rounded-md text-xs font-medium transition-all duration-200" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }} onClick={() => handleOrderNow(gig)}>
                                  Order Now
                                </button>
                                <button className="px-4 py-2 rounded-md text-xs border transition-all duration-200" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)', backgroundColor: 'transparent' }}>
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

          {/* Right AI Insights Sidebar */}
          <div className="w-80 p-6 overflow-y-auto hidden xl:block" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>AI Insights</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>Profile Strength</span>
                    <span style={{ color: 'var(--text-primary)' }}>{profileStats.profileStrength}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="h-2 rounded-full transition-all duration-500" style={{width: `${profileStats.profileStrength}%`, backgroundColor: 'var(--button-action)'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: 'var(--text-secondary)' }}>Market Demand</span>
                    <span style={{ color: 'var(--text-primary)' }}>{profileStats.marketDemand}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <div className="h-2 rounded-full transition-all duration-500" style={{width: `${profileStats.marketDemand}%`, backgroundColor: 'var(--button-action)'}}></div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-start">
                    <span className="mr-2 text-lg">💡</span>
                    <div className="flex-1">
                      <p className="font-medium text-xs mb-1" style={{ color: 'var(--text-primary)' }}>Top Suggestion:</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add 2-3 more portfolio projects to increase credibility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
