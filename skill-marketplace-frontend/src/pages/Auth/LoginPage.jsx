import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  const { email, password } = formData;
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      console.log('Login successful');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
      setLocalError(error.message || 'Login failed. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Login
          </span>
        </h2>
        
        {/* Error Display */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
          >
            {displayError}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              disabled={isLoading}
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              disabled={isLoading}
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
            />
          </div>
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account? <Link to="/signup" className="text-purple-400 hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
