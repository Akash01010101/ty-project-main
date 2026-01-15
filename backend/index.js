/**
 * Skill Marketplace Backend Server
 * 
 * Main entry point with security hardening applied.
 * Implements OWASP best practices for API security.
 * 
 * @module index
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, './.env') });

const http = require('http');
const { Server } = require('socket.io');

// Import security middleware
const { globalLimiter } = require('./middleware/rateLimiter');
const { sanitizeAll, preventNoSQLInjection } = require('./middleware/sanitize');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
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

// =============================================================================
// SECURITY MIDDLEWARE
// Applied in order of importance for security
// =============================================================================

// Helmet: Sets various HTTP headers for security (OWASP recommendation)
// Protects against XSS, clickjacking, MIME sniffing, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow file serving
}));

// Global rate limiting - applies to all routes
// Prevents DDoS and brute force attacks
app.use(globalLimiter);

// CORS configuration
// SECURITY: In production, specify exact allowed origins
app.use(cors({
  // Dynamically allow the origin that made the request
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true, // Allow cookies/headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Add 'Range' to allowed headers (CRITICAL for PDFs)
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'], 
  exposedHeaders: ['Content-Length', 'Content-Range'], // Expose headers needed for PDF progress bars
  maxAge: 86400, // Cache preflight for 24 hours
}));

// Body parsing with size limits to prevent DoS
app.use(express.json({ 
  limit: '10kb' // Limit JSON body size (OWASP recommendation)
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb' 
}));

// Input sanitization - cleans all incoming data
// Prevents XSS and injection attacks
app.use(sanitizeAll());

// Prevent NoSQL injection attacks
app.use(preventNoSQLInjection);

// Attach socket.io instance to requests
app.use((req, res, next) => {
  req.io = io;
  req.getUser = getUser;
  next();
});

// Serve static uploaded files with specific headers to prevent auto-download
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath).toLowerCase() === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

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
const chatRouter = require('./routes/chat');
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
  res.json({ message: 'SkillMarketPlace API Server' });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
