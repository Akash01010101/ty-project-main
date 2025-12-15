import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit({ rating, comment });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-5 sm:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leave a Review</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Share your experience with the seller.</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-full transition-colors"
                  style={{ color: 'var(--text-secondary)'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--button-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Your Rating</label>
                  <div 
                    className="flex items-center justify-center space-x-2"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={40}
                        className={`cursor-pointer transition-all duration-200 transform hover:scale-110`}
                        style={{ color: (hoverRating || rating) >= star ? '#facc15' : 'var(--border-color)'}}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        fill={(hoverRating || rating) >= star ? '#facc15' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={5}
                    className="block w-full text-sm rounded-lg p-4 focus:ring-2"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      borderWidth: '1px',
                      focusRingColor: 'var(--focus-ring)',
                    }}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience, the quality of the work, and your overall satisfaction..."
                  />
                </div>
              </div>
            </div>

            <div 
              className="px-5 sm:px-8 py-4 sm:py-5 border-t"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)',
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem'
              }}
            >
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold rounded-lg border transition-colors duration-200"
                  style={{
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--button-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating === 0 || !comment}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--button-action)' }}
                >
                  Submit & Clear Payment
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
