require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const tradeRoutes = require('./routes/trades');
const messageRoutes = require('./routes/messages');
const matchRoutes = require('./routes/matches');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const ratingRoutes = require('./routes/ratings');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files — uploaded images
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/trades', messageRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Socket connected: ${socket.id}`);
  }

  socket.on('join_user', (userId) => {
    socket.join(userId);
  });

  socket.on('join_trade', (tradeId) => {
    socket.join(`trade_${tradeId}`);
  });

  socket.on('leave_trade', (tradeId) => {
    socket.leave(`trade_${tradeId}`);
  });

  socket.on('typing', ({ tradeId, username }) => {
    socket.to(`trade_${tradeId}`).emit('user_typing', { username });
  });

  socket.on('stop_typing', ({ tradeId }) => {
    socket.to(`trade_${tradeId}`).emit('user_stop_typing');
  });

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Socket disconnected: ${socket.id}`);
    }
  });
});

// Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = { app, server };
