const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite default port
  credentials: true
}));
app.use(express.json()); // Added back
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static uploaded files

// Database connection
console.log(process.env.PORT)
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
const authRouter = require('./routes/auth');
const gigRouter = require('./routes/gigs');
app.use('/api/auth', authRouter);
app.use('/api/gigs', gigRouter);
const orderRouter = require('./routes/orders');
app.use('/api/orders', orderRouter);
const portfolioRouter = require('./routes/portfolio');
app.use('/api/portfolio', portfolioRouter);
const transactionRouter = require('./routes/transactions');
app.use('/api/transactions', transactionRouter);
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
  res.json({ message: 'SkillMarketPlace API Server' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
