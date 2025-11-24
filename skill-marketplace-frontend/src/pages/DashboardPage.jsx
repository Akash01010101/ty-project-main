import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Filter } from 'lucide-react';
import MyGigs from '../components/MyGigs';
import Portfolio from '../components/Portfolio';
import Messages from '../components/Messages';
import Orders from '../components/Orders';
import ExpenseIncome from '../components/ExpenseIncome';
import UserSearch from '../components/UserSearch';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('Browse Gigs');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  // Logout handler
  const handleLogout = () => {
    try {
      console.log('Logging out from dashboard...');
      logout();
      // Use window.location to bypass ProtectedRoute redirect
      window.location.href = '/';
      console.log('Dashboard logout successful - redirected to landing page');
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
    } else if (tab === 'expense-income') {
      setActiveTab('Expense and Income');
    } else if (tab === 'user-search') {
      setActiveTab('Search Users');
    }
  }, [location.search]);
  
  // Mock data that matches the screenshot
  const gigs = [
    {
      id: 1,
      title: 'React.js Web Development',
      user: {
        name: 'Ananya Singh',
        location: 'IIT Delhi',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 4.9,
        reviews: 47
      },
      description: "I'll build responsive web applications using React, Next.js, and modern JavaScript. Perfect for student projects, portfolios, or small business...",
      price: 25,
      duration: '2-3 days',
      skills: ['React', 'JavaScript', 'Next.js', '+1']
    },
    {
      id: 2,
      title: 'Calculus & Statistics Tutoring',
      user: {
        name: 'Rohan Patel',
        location: 'IIT Bombay',
        avatar: 'https://i.pravatar.cc/150?img=2',
        rating: 4.8,
        reviews: 89
      },
      description: "One-on-one tutoring sessions for Calculus I, II, III and Statistics. I'm a Math major with 3+ years of tutoring experience.",
      price: 20,
      duration: '1 hour',
      skills: ['Math', 'Calculus', 'Statistics', '+1']
    },
    {
      id: 3,
      title: 'Professional Video Editing',
      user: {
        name: 'Kavya Menon',
        location: 'NIT Trichy',
        avatar: 'https://i.pravatar.cc/150?img=3',
        rating: 4.7,
        reviews: 34
      },
      description: "High-quality video editing for YouTube, social media, or academic projects. I use Adobe Premiere Pro and After Effects.",
      price: 30,
      duration: '1-2 days',
      skills: ['Video Editing', 'Adobe Premiere', 'After Effects']
    },
    {
      id: 4,
      title: 'Graphic Design & Branding',
      user: {
        name: 'Ishaan Gupta',
        location: 'BITS Pilani',
        avatar: 'https://i.pravatar.cc/150?img=4',
        rating: 4.9,
        reviews: 56
      },
      description: "Custom logos, business cards, and brand identity design. I specialize in modern, clean designs that make your brand stand out.",
      price: 35,
      duration: '2-4 days',
      skills: ['Logo Design', 'Branding', 'Photoshop', '+1']
    }
  ];

  const tabs = ['Browse Gigs', 'AI Picks', 'My Gigs', 'Portfolio', 'Messages', 'Orders', 'Expense and Income', 'Search Users'];
  const categories = ['All Categories', 'React Development', 'Math Tutoring', 'Video Editing', 'Graphic Design', 'Data Science', 'Writing'];

  const profileStats = {
    rating: 4.8,
    totalGigs: 23,
    skills: ['React Development', 'Math Tutoring'],
    profileStrength: 96,
    marketDemand: 81,
    activeOrders: 2,
    portfolioItems: 3,
    thisMonth: 240,
    responseRate: 98
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="aurora-background"></div>
      <div className="relative z-10">
      {/* Header */}
      <div className="backdrop-blur-lg border-b" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand - Left Side */}
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>SkillMarketPlace</h1>
            </div>
            
            {/* User Info and Controls - Right Side */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 lg:space-x-4 text-right sm:text-left">
                {/* User Profile Section */}
                <div className="flex flex-col items-end sm:items-center sm:flex-row sm:space-x-2">
                  {/* Profile Picture */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 mb-1 sm:mb-0" style={{ borderColor: 'var(--accent-primary)' }}>
                    <img 
                      src="https://i.pravatar.cc/100?img=3" 
                      alt="User Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* User Text Info */}
                  <div className="flex flex-col sm:items-start">
                    <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user?.name || 'User'}
                    </span>
                    {/* Hide university on mobile, show on sm+ screens */}
                    <span className="hidden sm:block text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {user?.university || 'State University'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <ThemeToggle />
                <button 
                  onClick={handleLogout}
                  className="px-3 py-2 sm:px-4 border rounded-lg hover:scale-105 transition-all duration-300 text-xs sm:text-sm font-medium min-h-[44px] flex items-center justify-center touch-manipulation" 
                  style={{ 
                    color: 'var(--text-accent)', 
                    borderColor: 'var(--text-accent)', 
                    backgroundColor: 'transparent' 
                  }} 
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'} 
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Profile Card */}
            <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Your Profile</h3>
              </div>
              <div className="flex items-center mb-3 sm:mb-4">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{profileStats.rating}/5.0</span>
                <span className="ml-1 text-sm" style={{ color: 'var(--text-secondary)' }}>({profileStats.totalGigs} gigs)</span>
              </div>
              <div className="mb-3 sm:mb-4">
                <h4 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Your Skills</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {profileStats.skills.map((skill, index) => (
                    <span key={index} className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full" style={{ backgroundColor: 'var(--accent-secondary)', color: 'var(--accent-text)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 min-h-[44px]" style={{ background: 'var(--button-primary)', color: 'var(--button-text)' }}>
                Edit Profile
              </button>
            </div>

            {/* AI Insights */}
            <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>AI Insights</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>Profile Strength</span>
                    <span style={{ color: 'var(--text-primary)' }}>{profileStats.profileStrength}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--button-secondary)' }}>
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: `${profileStats.profileStrength}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>Market Demand</span>
                    <span style={{ color: 'var(--text-primary)' }}>{profileStats.marketDemand}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--button-secondary)' }}>
                    <div className="h-2 rounded-full transition-all duration-500" style={{width: `${profileStats.marketDemand}%`, backgroundColor: 'var(--accent-primary)'}}></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--accent-secondary)', borderColor: 'var(--accent-primary)' }}>
                  <div className="flex items-start">
                    <span className="mr-2 text-lg sm:text-xl" style={{ color: 'var(--accent-primary)' }}>💡</span>
                    <div className="flex-1">
                      <p className="font-medium text-xs sm:text-sm" style={{ color: 'var(--accent-text)' }}>Top Suggestion:</p>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Add 2-3 more portfolio projects to increase credibility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-sm border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>Quick Stats</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Active Orders</span>
                  <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{profileStats.activeOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Portfolio Items</span>
                  <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{profileStats.portfolioItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>This Month</span>
                  <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--accent-primary)' }}>${profileStats.thisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>Response Rate</span>
                  <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{profileStats.responseRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 mt-3 sm:mt-4 lg:mt-0">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-6 mb-3 sm:mb-4 lg:mb-6 border-b overflow-x-auto scrollbar-hide pb-1" style={{ borderColor: 'var(--border-color)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-2 sm:px-3 text-xs sm:text-sm font-medium relative whitespace-nowrap flex-shrink-0 transition-all duration-300 min-h-[44px] flex items-center`}
                  style={{
                    color: activeTab === tab ? 'var(--text-accent)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab ? '2px solid var(--text-accent)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {tab}
                  {(tab === 'Messages' || tab === 'Orders') && (
                    <span className="absolute -top-1 -right-1 sm:-right-2 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-accent)' }}></span>
                  )}
                </button>
              ))}
            </div>

            {/* Content based on active tab */}
            {activeTab === 'My Gigs' ? (
              <MyGigs />
            ) : activeTab === 'Portfolio' ? (
              <Portfolio />
            ) : activeTab === 'Messages' ? (
              <Messages />
            ) : activeTab === 'Orders' ? (
              <Orders />
            ) : activeTab === 'Expense and Income' ? (
              <ExpenseIncome />
            ) : activeTab === 'Search Users' ? (
              <UserSearch />
            ) : (
              <>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search gigs, skills, or keywords..."
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 sm:flex-none px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
    
                {/* Gigs Grid */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {gigs.map((gig) => (
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-sm border hover:shadow-md transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--bg-accent)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <img
                          src={gig.user.avatar}
                          alt={gig.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{gig.title}</h3>
                          <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span>{gig.user.name}</span>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="text-xs sm:text-sm">{gig.user.location}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 mr-1" />
                              <span className="text-xs sm:text-sm">{gig.user.rating} ({gig.user.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {gig.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-accent)' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="text-left sm:text-right">
                            <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>${gig.price}</div>
                            <div className="text-xs flex items-center" style={{ color: 'var(--text-secondary)' }}>
                              <Clock className="w-3 h-3 mr-1" />
                              {gig.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <button className="px-3 sm:px-4 py-2 border rounded text-sm hover:scale-105 transition-all duration-300" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                            Contact
                          </button>
                          <button className="px-3 sm:px-4 py-2 rounded text-sm hover:scale-105 transition-all duration-300" style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}>
                            Order Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
