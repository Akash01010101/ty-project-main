import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        const data = await response.json();
        if (response.ok) {
          setWallet(data);
        } else {
          console.error('Failed to fetch wallet', data);
        }
      } catch (error) {
        console.error('Error fetching wallet', error);
      }
    };
    fetchWallet();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await response.json();
      if (response.ok) {
        setWallet(data);
        setAmount('');
      } else {
        console.error('Deposit failed', data);
      }
    } catch (error) {
      console.error('Error during deposit', error);
    }
  };

  if (!wallet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-3xl font-bold text-center text-white mb-8">My Wallet</h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <p className="text-gray-300 text-lg">Current Balance</p>
          <p className="text-5xl font-bold text-white">${wallet.balance.toFixed(2)}</p>
        </div>
        <form onSubmit={handleDeposit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="amount">
              Deposit Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-full hover:scale-105 transform transition-transform duration-300"
          >
            Deposit
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default WalletPage;
