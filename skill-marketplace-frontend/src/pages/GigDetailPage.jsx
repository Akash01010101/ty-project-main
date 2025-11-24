import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jwtDecode } from 'jwt-decode'; // To decode JWT token

const GigDetailPage = () => {
  const [gig, setGig] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user);
      } catch (error) {
        console.error('Failed to decode token', error);
      }
    }

    const fetchGig = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        const data = await response.json();
        if (response.ok) {
          setGig(data);
        } else {
          console.error('Failed to fetch gig', data);
        }
      } catch (error) {
        console.error('Error fetching gig', error);
      }
    };
    fetchGig();
  }, [id]);

  const handleSendOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({
          gigId: gig._id,
          price: parseFloat(offerPrice),
          message: offerMessage,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Offer sent successfully', data);
        setShowOfferModal(false);
        setOfferPrice('');
        setOfferMessage('');
        // Optionally, show a success message or navigate
      } else {
        console.error('Failed to send offer', data);
      }
    } catch (error) {
      console.error('Error sending offer', error);
    }
  };

  if (!gig) {
    return <div>Loading...</div>;
  }

  const isGigCreator = currentUser && gig.creator && currentUser.id === gig.creator._id;

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-4">{gig.title}</h2>
        <p className="text-gray-300 mb-6">{gig.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {gig.skills.map((skill, index) => (
            <span key={index} className="bg-purple-500/50 text-white px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mb-6">
          <p className="text-2xl font-bold text-white">${gig.price}</p>
          <div className="text-right">
            <p className="text-gray-300">Created by:</p>
            <p className="text-white font-semibold">{gig.creator.name}</p>
          </div>
        </div>
        {!isGigCreator && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowOfferModal(true)}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:scale-105 transform transition-transform duration-300"
          >
            Send Offer
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showOfferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Send Offer for {gig.title}</h3>
              <form onSubmit={handleSendOffer}>
                <div className="mb-4">
                  <label htmlFor="offerPrice" className="block text-gray-300 text-sm font-bold mb-2">
                    Your Offer Price ($)
                  </label>
                  <input
                    type="number"
                    id="offerPrice"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700 text-white"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="e.g., 150"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="offerMessage" className="block text-gray-300 text-sm font-bold mb-2">
                    Message to Creator
                  </label>
                  <textarea
                    id="offerMessage"
                    rows="4"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-700 text-white"
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Tell the creator why you're a good fit..."
                    required
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
                  >
                    Send Offer
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowOfferModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GigDetailPage;
