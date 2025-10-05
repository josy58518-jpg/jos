import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Agent location updates
  updateAgentLocation(data) {
    if (this.socket) {
      this.socket.emit('agent-location-update', data);
    }
  }

  // Customer order tracking
  trackOrder(data) {
    if (this.socket) {
      this.socket.emit('track-order', data);
    }
  }

  // Order status updates
  updateOrderStatus(data) {
    if (this.socket) {
      this.socket.emit('order-status-update', data);
    }
  }

  // Event listeners
  onDeliveryLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery-location-update', callback);
    }
  }

  onOrderStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('order-status-changed', callback);
    }
  }

  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on('new-order', callback);
    }
  }

  onRestaurantOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('restaurant-order-update', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();