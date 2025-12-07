import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMyTransactions } from '../api/transactions';

const WalletPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getMyTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen p-4">
      <h2 className="text-3xl font-bold text-center text-white mb-8">My Wallet</h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <p className="text-gray-300 text-lg">Current Balance</p>
          <p className="text-5xl font-bold text-white">${user?.walletBalance.toFixed(2)}</p>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center">No transactions yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">{tx.description}</p>
                    <p className="text-sm text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WalletPage;