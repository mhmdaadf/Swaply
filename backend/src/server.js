require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const tradeRoutes = require('./routes/trades');
const messageRoutes = require('./routes/messages');
const matchRoutes = require('./routes/matches');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);

// Security & Logging
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow local images to be served
}));
app.use(morgan('combined'));
app.set('trust proxy', 1); // For Render load balancer

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handler
app.use(errorHandler);

// Socket.io events
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

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
    console.log(`Socket disconnected: ${socket.id}`);
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
