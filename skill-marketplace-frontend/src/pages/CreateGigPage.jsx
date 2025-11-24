import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createGig } from '../api/dashboard';

const CreateGigPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    price: '',
    duration: '',
  });

  const { title, description, skills, price, duration } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const newGig = {
        title,
        description,
        skills: skills.split(',').map(s => s.trim()),
        price: Number(price),
        duration,
      };
      
      await createGig(newGig);
      
      navigate('/dashboard?tab=my-gigs');
    } catch (error) {
      console.error('Error during gig creation', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="aurora-background"></div>
      <div className="relative z-10 flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl w-full max-w-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">
            Create a Gig
          </h2>
          <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="title">
                Gig Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={onChange}
                placeholder="e.g., React.js Web Development"
                required
                className="w-full py-3 px-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={onChange}
                placeholder="Describe what you'll deliver and what makes your service unique..."
                required
                rows={4}
                className="w-full py-3 px-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 resize-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="skills">
                Skills & Technologies
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={skills}
                onChange={onChange}
                placeholder="React, JavaScript, Next.js, CSS"
                required
                className="w-full py-3 px-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
              />
              <p className="text-gray-500 text-xs mt-1">Separate skills with commas</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="price">
                Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={price}
                  onChange={onChange}
                  placeholder="25"
                  min="1"
                  required
                  className="w-full py-3 pl-8 pr-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="duration">
                Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={duration}
                onChange={onChange}
                placeholder="e.g., 2-3 days"
                required
                className="w-full py-3 px-4 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                Create Gig
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateGigPage;
