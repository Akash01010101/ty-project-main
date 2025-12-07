const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, './.env') });

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

const User = require('./models/User');

io.on('connection', (socket) => {
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', onlineUsers);
  });

  socket.on('sendMessage', async ({ receiverId, message }) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit('getMessage', message);
    }
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.emit('getUsers', onlineUsers);
  });
});


const port = process.env.PORT || 9000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite default port
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  req.getUser = getUser;
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static uploaded files

// Database connection
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
const conversationRouter = require('./routes/conversations');
app.use('/api/conversations', conversationRouter);
const offerRouter = require('./routes/offers');
app.use('/api/offers', offerRouter);
const paymentRouter = require('./routes/payments');
app.use('/api/payments', paymentRouter);

app.get('/', (req, res) => {
  res.json({ message: 'SkillMarketPlace API Server' });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
