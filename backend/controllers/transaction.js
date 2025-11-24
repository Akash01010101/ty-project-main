const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  const user = req.user.userId;

  try {
    const transactions = await Transaction.find({ user });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const addTransaction = async (req, res) => {
  const { type, amount, description, order } = req.body;
  const user = req.user.userId;

  try {
    const transaction = new Transaction({
      user,
      type,
      amount,
      description,
      order,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getTransactions,
  addTransaction,
};
