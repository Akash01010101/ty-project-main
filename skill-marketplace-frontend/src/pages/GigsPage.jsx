import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GigsPage = () => {
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gigs`);
        const data = await response.json();
        if (response.ok) {
          setGigs(data);
        } else {
          console.error('Failed to fetch gigs', data);
        }
      } catch (error) {
        console.error('Error fetching gigs', error);
      }
    };
    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Available Gigs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {gigs.map((gig) => (
          <motion.div
            key={gig._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl"
          >
            <h3 className="text-xl font-bold text-white mb-2">{gig.title}</h3>
            <p className="text-gray-300 mb-4">{gig.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {gig.skills.map((skill, index) => (
                <span key={index} className="bg-purple-500/50 text-white px-2 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold text-white">${gig.price}</p>
              <Link to={`/gig/${gig._id}`} className="text-purple-400 hover:underline">
                View Details
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GigsPage;
