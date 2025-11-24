import { Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logging out...');
      logout();
      setShowUserMenu(false);
      setIsOpen(false); // Also close mobile menu
      // Use window.location to bypass ProtectedRoute redirect
      window.location.href = '/';
      console.log('Logout successful - redirected to landing page');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-lg shadow-lg"
      style={{
        backgroundColor: 'var(--bg-accent)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>SkillMarketplace</h1>
        <nav className="hidden md:flex space-x-8 items-center">
          <Link to="/" onClick={handleHomeClick} className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Home</Link>
          <a href="#features" className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Features</a>
          <a href="#how-it-works" className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>How It Works</a>
          <a href="#testimonials" className="transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Testimonials</a>
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-accent)', color: 'var(--text-primary)' }}
              >
                <User size={20} />
                <span className="font-medium">{user?.name || 'User'}</span>
              </button>
              
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg backdrop-blur-lg border z-50"
                  style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Welcome, {user?.name}!
                    </div>
                    <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 flex items-center space-x-2 transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 font-bold rounded-full hover:scale-105 transform transition-all duration-300" style={{ backgroundColor: 'var(--button-primary)', color: 'var(--bg-primary)' }}>Login</Link>
              <Link to="/signup" className="px-4 py-2 font-bold rounded-full border transform transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'var(--button-secondary)', color: 'var(--text-accent)', borderColor: 'var(--border-color)' }}>Sign Up</Link>
            </>
          )}
        </nav>
        <div className="md:hidden flex items-center space-x-3">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} style={{ color: 'var(--text-primary)' }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden backdrop-blur-lg" style={{ backgroundColor: 'var(--bg-accent)', borderTop: '1px solid var(--border-color)' }}>
          <nav className="px-6 pt-2 pb-4 space-y-2">
            <Link to="/" onClick={handleHomeClick} className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Home</Link>
            <a href="#features" className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Features</a>
            <a href="#how-it-works" className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>How It Works</a>
            <a href="#testimonials" className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Testimonials</a>
            
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 py-2" style={{ color: 'var(--text-primary)' }}>
                  <User size={20} />
                  <span className="font-medium">Welcome, {user?.name}!</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left transition-colors duration-300 flex items-center space-x-2"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'} onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="block transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'} onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
