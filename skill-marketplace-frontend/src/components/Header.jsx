import { Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

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
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      <div className="relative flex justify-between h-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Left content */}
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>SkillMarketplace</h1>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" onClick={handleHomeClick} className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Home</Link>
            <a href="#features" className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Features</a>
            <a href="#how-it-works" className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>How It Works</a>
            <a href="#testimonials" className="text-sm transition-colors duration-300" style={{ color: 'var(--text-secondary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>Testimonials</a>
          </nav>
        </div>

        {/* Right content */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <Button
                onClick={() => setShowUserMenu(!showUserMenu)}
                variant="ghost"
                className="flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-300"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' }}
              >
                <User size={20} />
                <span className="font-medium">{user?.name || 'User'}</span>
              </Button>

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
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 flex items-center space-x-2 transition-colors duration-300 hover:bg-white/10"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" className="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-300 hover:bg-white/10" style={{ color: 'var(--text-secondary)' }}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:scale-105" style={{ backgroundColor: 'var(--button-action)', color: '#fff' }}>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" size="icon" className="md:hidden hover:bg-white/10" style={{ color: 'var(--text-primary)' }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden backdrop-blur-lg" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
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
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start transition-colors duration-300 flex items-center space-x-2 hover:bg-white/10"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
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
