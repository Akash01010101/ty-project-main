import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, ExternalLink, Calendar, Tag } from 'lucide-react';
import { getPortfolio, addPortfolioItem } from '../api/dashboard';

// Portfolio Card Component - moved outside to prevent re-creation
const PortfolioCard = ({ item, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="backdrop-blur-lg rounded-lg border transition-all duration-200 overflow-hidden"
    style={{ 
      backgroundColor: 'var(--bg-accent)', 
      borderColor: 'var(--border-color)'
    }}
  >
    <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: 'var(--button-secondary)' }}>
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = `https://picsum.photos/400/300?random=${item._id}`;
        }}
      />
      <div className="absolute top-3 right-3 flex space-x-2">
        {item.projectUrl && (
          <a
            href={item.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ 
              backgroundColor: 'var(--button-secondary)', 
              color: 'var(--text-secondary)'
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onDelete(item._id)}
          className="p-2 hover:text-red-400 rounded-lg transition-colors duration-200"
          style={{ 
            backgroundColor: 'var(--button-secondary)', 
            color: 'var(--text-secondary)'
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
        <h3 className="text-lg font-semibold mb-2 sm:mb-0" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
        <div className="flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
      
      <div className="flex items-center mb-4">
        <Tag className="w-4 h-4 mr-2" style={{ color: 'var(--accent-primary)' }} />
        <span className="text-sm" style={{ color: 'var(--accent-text)' }}>{item.category}</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {item.skills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: 'var(--accent-secondary)', 
              color: 'var(--accent-text)' 
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    imageUrl: '',
    projectUrl: '',
    category: 'Web Development'
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolio();
        setPortfolioItems(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleDeleteItem = useCallback(async (itemId) => {
    // try {
    //   await deletePortfolioItem(itemId);
    //   const updatedItems = portfolioItems.filter(item => item._id !== itemId);
    //   setPortfolioItems(updatedItems);
    // } catch (error) {
    //   console.error('Error deleting portfolio item:', error);
    // }
  }, [portfolioItems]);

  const handleCreateItem = useCallback(async (e) => {
    e.preventDefault();
    
    const newItem = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      projectUrl: formData.projectUrl,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      imageUrl: formData.imageUrl || `https://picsum.photos/400/300?random=${Date.now()}`
    };

    try {
      const createdItem = await addPortfolioItem(newItem);
      setPortfolioItems([...portfolioItems, createdItem]);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        skills: '',
        imageUrl: '',
        projectUrl: '',
        category: 'Web Development'
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating portfolio item:', error);
    }
  }, [formData, portfolioItems]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  const categories = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'AI/ML', 'Game Development', 'Other'];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
        <Plus className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No portfolio items yet</h3>
      <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>Showcase your best work and attract more clients!</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateForm(true)}
        className="px-6 py-3 font-medium rounded-lg transition-all duration-200"
        style={{ 
          background: 'var(--button-primary)',
          color: 'var(--button-text)'
        }}
      >
        Add Your First Project
      </motion.button>
    </div>
  );





  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Portfolio</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Showcase your best work and projects</p>
        </div>
        
        {portfolioItems.length > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            style={{ 
              background: 'var(--button-primary)',
              color: 'var(--button-text)'
            }}
          >
            <span className="flex items-center justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </span>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      {portfolioItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{portfolioItems.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Projects</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {[...new Set(portfolioItems.map(item => item.category))].length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Categories</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {[...new Set(portfolioItems.flatMap(item => item.technologies))].length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Technologies</div>
          </div>
          <div className="backdrop-blur-lg rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
            <div className="text-2xl font-bold text-green-400">
              {portfolioItems.filter(item => item.projectUrl).length}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Live Projects</div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-lg rounded-lg p-6 border mb-6"
          style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Project</h3>
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., E-commerce Website"
                  required
                  autoComplete="off"
                  className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project, its goals, and what you achieved..."
                required
                rows={3}
                autoComplete="off"
                className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 resize-none text-sm"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Technologies Used
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleInputChange}
                placeholder="React, Node.js, MongoDB, TailwindCSS"
                required
                autoComplete="off"
                className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 text-sm"
              />
              <p className="text-gray-500 text-xs mt-1">Separate technologies with commas</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Project URL (optional)
                </label>
                <input
                  type="url"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleInputChange}
                  placeholder="https://myproject.com"
                  autoComplete="off"
                  className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  autoComplete="off"
                  className="w-full py-2 px-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-400 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
              >
                Add Project
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Portfolio Content */}
      <div className="backdrop-blur-lg rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
          </div>
        ) : portfolioItems.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <PortfolioCard key={item._id} item={item} onDelete={handleDeleteItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;