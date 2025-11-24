import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

const ManageOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user);
      } catch (error) {
        // console.error('Failed to decode token', error);
      }
    }

    const fetchOffers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/gig/${currentUser.id}`, {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setOffers(data);
        } else {
          // console.error('Failed to fetch offers', data);
        }
      } catch (error) {
        // console.error('Error fetching offers', error);
      }
    };

    if (currentUser) {
      fetchOffers();
    }
  }, [currentUser]);

  const handleAcceptOffer = async (offerId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${offerId}/accept`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Offer accepted', data);
        setOffers(offers.map(offer => offer._id === offerId ? { ...offer, status: 'accepted' } : offer));
        // Optionally, navigate to the newly created team page or show a success message
      } else {
        // console.error('Failed to accept offer', data);
      }
    } catch (error) {
      // console.error('Error accepting offer', error);
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers/${offerId}/reject`, {
        method: 'PUT',
        headers: {
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      const data = await response.json();
      if (response.ok) {
        // console.log('Offer rejected', data);
        setOffers(offers.map(offer => offer._id === offerId ? { ...offer, status: 'rejected' } : offer));
      } else {
        // console.error('Failed to reject offer', data);
      }
    } catch (error) {
      // console.error('Error rejecting offer', error);
    }
  };

  if (!currentUser) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Manage Offers for Your Gigs</h2>
        {offers.length === 0 ? (
          <p className="text-gray-300">No offers received yet.</p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 p-4 rounded-lg border border-white/20"
              >
                <h3 className="text-xl font-semibold text-white">Offer for: {offer.gig.title}</h3>
                <p className="text-gray-300">From: {offer.freelancer.name}</p>
                <p className="text-gray-300">Offered Price: <span className="font-bold text-green-400">${offer.price}</span></p>
                <p className="text-gray-300 mb-2">Message: {offer.message}</p>
                <p className="text-gray-400 text-sm">Status: {offer.status}</p>
                {offer.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAcceptOffer(offer._id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-sm"
                    >
                      Accept
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRejectOffer(offer._id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm"
                    >
                      Reject
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default ManageOffersPage;