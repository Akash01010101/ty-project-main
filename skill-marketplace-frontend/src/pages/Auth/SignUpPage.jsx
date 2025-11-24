import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    skills: '',
  });
  const [localError, setLocalError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: ''
  });

  const { name, email, password, university, skills } = formData;
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Real-time password validation
    if (e.target.name === 'password') {
      if (e.target.value.length < 6 && e.target.value.length > 0) {
        setPasswordValidation({
          isValid: false,
          message: 'Password must be at least 6 characters'
        });
      } else {
        setPasswordValidation({
          isValid: true,
          message: ''
        });
      }
    }
    
    // Clear errors when user starts typing
    if (error) clearError();
    if (localError) setLocalError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }
    
    if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    try {
      console.log('Starting registration...');
      await register({
        name,
        email,
        password,
        university: university || 'State University',
        skills: skills.split(',').map(s => s.trim()).filter(s => s.length > 0), // Split skills by comma and filter empty
      });
      console.log('Registration successful');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (error) {
      console.error('Registration failed:', error);
      setLocalError(error.message || 'Registration failed. Please try again.');
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl w-full max-w-lg"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Sign Up
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
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              disabled={isLoading}
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
            />
          </div>
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
              className={`shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white disabled:opacity-50 ${
                !passwordValidation.isValid ? 'border-red-500' : ''
              }`}
            />
            <p className={`text-xs mt-1 ${
              !passwordValidation.isValid ? 'text-red-400' : 'text-gray-400'
            }`}>
              {passwordValidation.message || 'Password must be at least 6 characters long'}
            </p>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="university">
              University (Optional)
            </label>
            <input
              type="text"
              id="university"
              name="university"
              value={university}
              onChange={onChange}
              disabled={isLoading}
              placeholder="State University"
              className="shadow appearance-none border rounded w-full py-3 px-4 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="skills">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={skills}
              onChange={onChange}
              disabled={isLoading}
              placeholder="JavaScript, React, Node.js"
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </motion.button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Already have an account? <Link to="/login" className="text-purple-400 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;

