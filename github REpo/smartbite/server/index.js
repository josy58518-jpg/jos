import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import restaurantRoutes from './routes/restaurants.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import locationRoutes from './routes/location.js';
import paymentRoutes from './routes/payment.js';
import reviewRoutes from './routes/reviews.js'; // NEW
import { initializeDatabase } from './config/database.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Initialize database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/location', authenticateToken, locationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes); // NEW - Reviews routes

// Socket.IO for real-time features
const activeDeliveryAgents = new Map();
const orderTracking = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Delivery agent location updates
  socket.on('agent-location-update', (data) => {
    const { agentId, latitude, longitude, orderId } = data;
    
    activeDeliveryAgents.set(agentId, {
      socketId: socket.id,
      latitude,
      longitude,
      lastUpdate: new Date(),
      orderId
    });

    // Broadcast location to customer tracking this order
    if (orderId && orderTracking.has(orderId)) {
      const customerSocketId = orderTracking.get(orderId);
      io.to(customerSocketId).emit('delivery-location-update', {
        latitude,
        longitude,
        orderId,
        timestamp: new Date()
      });
    }
  });

  // Customer starts tracking order
  socket.on('track-order', (data) => {
    const { orderId, customerId } = data;
    orderTracking.set(orderId, socket.id);
    
    // Send current agent location if available
    for (const [agentId, agentData] of activeDeliveryAgents) {
      if (agentData.orderId === orderId) {
        socket.emit('delivery-location-update', {
          latitude: agentData.latitude,
          longitude: agentData.longitude,
          orderId,
          timestamp: agentData.lastUpdate
        });
        break;
      }
    }
  });

  // Order status updates
  socket.on('order-status-update', (data) => {
    const { orderId, status, restaurantId, customerId } = data;
    
    // Notify customer
    if (orderTracking.has(orderId)) {
      const customerSocketId = orderTracking.get(orderId);
      io.to(customerSocketId).emit('order-status-changed', {
        orderId,
        status,
        timestamp: new Date()
      });
    }

    // Notify restaurant
    io.emit('restaurant-order-update', {
      orderId,
      status,
      restaurantId,
      timestamp: new Date()
    });
  });

  // Payment status updates
  socket.on('payment-update', (data) => {
    const { orderId, paymentStatus } = data;
    
    // Notify all relevant parties
    io.emit('payment-status-changed', {
      orderId,
      paymentStatus,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove agent from active list
    for (const [agentId, agentData] of activeDeliveryAgents) {
      if (agentData.socketId === socket.id) {
        activeDeliveryAgents.delete(agentId);
        break;
      }
    }

    // Remove from order tracking
    for (const [orderId, socketId] of orderTracking) {
      if (socketId === socket.id) {
        orderTracking.delete(orderId);
        break;
      }
    }
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});