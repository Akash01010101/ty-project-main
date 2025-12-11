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
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>My Wallet</h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="glow-border backdrop-blur-lg rounded-2xl p-8 shadow-xl max-w-2xl mx-auto"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="text-center mb-8">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Current Balance</p>
          <p className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>${user?.walletBalance.toFixed(2)}</p>
        </div>

        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
        {loading ? (
          <div className="text-center" style={{ color: 'var(--text-primary)' }}>Loading...</div>
        ) : (
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center" style={{ color: 'var(--text-secondary)' }}>No transactions yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx._id} className="glow-border-static flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleString()}</p>
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