import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getMyTransactions } from '../api/transactions';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Calendar,
  ShoppingBag,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Briefcase,
  Code,
  TestTube
} from 'lucide-react';

const WalletPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);

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

  // Calculate income and spent
  const { totalIncome, totalSpent, monthlyLimit } = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const spent = transactions
      .filter(tx => tx.type === 'expense' || tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    // Calculate monthly spending/withdrawal limit usage (example: 70% used)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyWithdrawals = transactions
      .filter(tx => 
        (tx.type === 'withdrawal' || tx.type === 'expense') && 
        new Date(tx.createdAt) >= thisMonth
      )
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    const limit = Math.min(Math.round((monthlyWithdrawals / (user?.walletBalance || 1000)) * 100), 100);

    return { totalIncome: income, totalSpent: spent, monthlyLimit: limit || 70 };
  }, [transactions, user]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      tx.description?.toLowerCase().includes(query) ||
      tx.type?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const visibleTransactions = filteredTransactions.slice(0, visibleCount);

  const getTransactionIcon = (tx) => {
    const desc = tx.description?.toLowerCase() || '';
    if (desc.includes('web dev') || desc.includes('development')) return Code;
    if (desc.includes('test')) return TestTube;
    if (desc.includes('order') || desc.includes('custom offer')) return ShoppingBag;
    if (tx.type === 'withdrawal') return ArrowUpRight;
    return Briefcase;
  };

  const getTransactionIconBg = (tx) => {
    const desc = tx.description?.toLowerCase() || '';
    if (tx.type === 'withdrawal') return 'rgba(239, 68, 68, 0.1)';
    if (desc.includes('web') || desc.includes('dev')) return 'rgba(59, 130, 246, 0.1)';
    if (desc.includes('test')) return 'rgba(249, 115, 22, 0.1)';
    return 'rgba(34, 197, 94, 0.1)';
  };

  const getTransactionIconColor = (tx) => {
    const desc = tx.description?.toLowerCase() || '';
    if (tx.type === 'withdrawal') return '#ef4444';
    if (desc.includes('web') || desc.includes('dev')) return '#3b82f6';
    if (desc.includes('test')) return '#f97316';
    return '#22c55e';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }) + ', ' + d.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - Wallet Summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                TOTAL BALANCE
              </p>
              <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                ${(user?.walletBalance || 0).toFixed(2)}
                <span className="text-base font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>USD</span>
              </h2>

              {/* Income / Spent */}
              <div className="flex gap-3 mb-6">
                <div 
                  className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: '#22c55e' }}>Income</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      ${totalIncome.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div 
                  className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                  <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: '#ef4444' }}>Spent</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      ${totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                className="w-full py-3 rounded-xl text-sm font-semibold mb-3 transition-all hover:opacity-90"
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
              >
                + Top Up Wallet
              </button>
              <button
                className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </motion.div>

            {/* Monthly Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Monthly Overview
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-1 rounded" 
                    style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                    LIMIT
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {monthlyLimit}%
                  </span>
                </div>
                
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${monthlyLimit}%`, 
                      backgroundColor: monthlyLimit > 80 ? '#ef4444' : '#22c55e' 
                    }}
                  />
                </div>
                
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  You have used {monthlyLimit}% of your monthly withdrawal limit.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Transaction History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Transaction History
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-10 pr-4 py-2 rounded-lg text-sm border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <button 
                  className="p-2 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transactions List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading transactions...</p>
              </div>
            ) : visibleTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Wallet className="w-12 h-12 mb-3" style={{ color: 'var(--text-secondary)' }} />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No transactions yet</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your transaction history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTransactions.map((tx) => {
                  const IconComponent = getTransactionIcon(tx);
                  const isIncome = tx.type === 'income';
                  
                  return (
                    <div 
                      key={tx._id}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
                    >
                      {/* Icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getTransactionIconBg(tx) }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: getTransactionIconColor(tx) }} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {tx.description || 'Transaction'}
                        </h4>
                        <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                          {tx.details || (isIncome ? 'Payment received' : 'Payment sent')}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Amount & Status */}
                      <div className="text-right flex-shrink-0">
                        <p 
                          className="text-base font-bold"
                          style={{ color: isIncome ? '#22c55e' : '#ef4444' }}
                        >
                          {isIncome ? '+' : '-'} ${tx.amount?.toFixed(2) || '0.00'}
                        </p>
                        <span 
                          className="text-[10px] font-medium px-2 py-0.5 rounded"
                          style={{ 
                            backgroundColor: tx.status === 'completed' || tx.status === 'Processed' 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : 'rgba(234, 179, 8, 0.1)',
                            color: tx.status === 'completed' || tx.status === 'Processed' 
                              ? '#22c55e' 
                              : '#eab308'
                          }}
                        >
                          {tx.status || 'Completed'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More */}
            {filteredTransactions.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="w-full mt-6 py-3 text-sm font-medium transition-all flex items-center justify-center gap-1"
                style={{ color: '#22c55e' }}
              >
                Load More Transactions
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;