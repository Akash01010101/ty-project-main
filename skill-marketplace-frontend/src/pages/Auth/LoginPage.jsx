import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      console.log('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setLocalError(error.message || 'Login failed. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        fontFamily: 'Circular, "Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >


        <div>
          <h1 
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome back
          </h1>
          <p 
            className="text-sm mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Sign in to your account
          </p>

          {/* Error Display */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-md text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444'
              }}
            >
              {displayError}
            </motion.div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 rounded-md flex items-center justify-center gap-3 text-sm font-normal transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-accent)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
              </svg>
              Continue with GitHub
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full py-6 rounded-md flex items-center justify-center gap-3 text-sm font-normal transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-accent)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#4285F4"/>
              </svg>
              Continue with SSO
            </Button>
          </div>

          {/* Login Form - No divider here */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2" 
                htmlFor="email"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                style={{
                  backgroundColor: 'var(--bg-accent)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  focusRingColor: 'var(--button-action)'
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label 
                  className="block text-sm font-medium" 
                  htmlFor="password"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Password
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 pr-10 rounded-md focus:outline-none focus:ring-2 transition-all duration-200 text-sm"
                  style={{
                    backgroundColor: 'var(--bg-accent)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'var(--button-action)',
                color: '#fff'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p 
            className="mt-8 text-center text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium hover:underline"
              style={{ color: 'var(--button-action)' }}
            >
              Sign Up Now
            </Link>
          </p>

          <p 
            className="mt-8 text-center text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            By continuing, you agree to Peerly's{' '}
            <Link to="/terms" className="underline hover:no-underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
            , and to receive periodic emails with updates.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
