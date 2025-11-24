import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Search } from 'lucide-react';
import { getTransactions } from '../api/dashboard';

// Transaction Item Component
const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b last:border-b-0 hover:scale-[1.01] transition-all duration-200"
      style={{ borderColor: 'var(--border-color)' }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-secondary)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <div className="flex-1 space-y-1 mb-2 sm:mb-0">
        <div className="flex items-start space-x-2">
          <div className={`mt-1 ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
            {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
              {transaction.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
              <div className="flex items-center text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(transaction.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <span className={`font-semibold text-sm sm:text-base ${
          isIncome ? 'text-green-500' : 'text-red-500'
        }`}>
          {isIncome ? '+' : '-'}${transaction.amount}
        </span>
      </div>
    </motion.div>
  );
};

const ExpenseIncome = () => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesFilter = filterType === 'all' || transaction.type === filterType;
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    
    return { income, expenses, balance };
  }, [transactions]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Expense and Income</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your earnings and spending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Income</p>
              <p className="text-2xl font-bold text-green-500">${totals.income}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
              <p className="text-2xl font-bold text-red-500">${totals.expenses}</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg rounded-lg p-4 sm:p-6 border" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Balance</p>
              <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(totals.balance)}
              </p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--button-secondary)' }}>
              <DollarSign className="w-6 h-6" style={{ color: 'var(--text-accent)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 min-w-[120px]"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="backdrop-blur-lg rounded-lg border min-h-[400px]" style={{ backgroundColor: 'var(--bg-accent)', borderColor: 'var(--border-color)' }}>
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Transactions</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--button-secondary)' }}>
              <DollarSign className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No transactions found</h3>
            <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your transactions will appear here once you start earning or spending'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction._id}
                transaction={transaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseIncome;