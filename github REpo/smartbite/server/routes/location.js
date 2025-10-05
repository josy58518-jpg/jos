import express from 'express';
import { pool } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Update delivery agent location
router.post('/update', requireRole(['agent']), async (req, res) => {
  try {
    const { order_id, latitude, longitude } = req.body;

    // Verify agent is assigned to this order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND agent_id = ? AND status = ?',
      [order_id, req.user.id, 'in_transit']
    );

    if (orders.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update location for this order' });
    }

    // Insert location update
    await pool.execute(
      'INSERT INTO delivery_locations (order_id, agent_id, latitude, longitude) VALUES (?, ?, ?, ?)',
      [order_id, req.user.id, latitude, longitude]
    );

    // Emit real-time location update
    const io = req.app.get('io');
    io.emit('agent-location-update', {
      orderId: order_id,
      agentId: req.user.id,
      latitude,
      longitude,
      timestamp: new Date()
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get delivery tracking for customer
router.get('/track/:orderId', requireRole(['customer', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Verify customer owns this order (unless admin)
    if (req.user.role === 'customer') {
      const [orders] = await pool.execute(
        'SELECT customer_id FROM orders WHERE id = ?',
        [orderId]
      );

      if (orders.length === 0 || orders[0].customer_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to track this order' });
      }
    }

    // Get latest location
    const [locations] = await pool.execute(
      `SELECT dl.*, u.name as agent_name, u.phone as agent_phone
       FROM delivery_locations dl
       JOIN users u ON dl.agent_id = u.id
       WHERE dl.order_id = ?
       ORDER BY dl.timestamp DESC
       LIMIT 1`,
      [orderId]
    );

    if (locations.length === 0) {
      return res.status(404).json({ error: 'No tracking information available' });
    }

    res.json(locations[0]);
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ error: 'Failed to get tracking information' });
  }
});

// Get location history for order
router.get('/history/:orderId', requireRole(['customer', 'agent', 'admin']), async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Verify permissions
    if (req.user.role === 'customer') {
      const [orders] = await pool.execute(
        'SELECT customer_id FROM orders WHERE id = ?',
        [orderId]
      );

      if (orders.length === 0 || orders[0].customer_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view this order history' });
      }
    } else if (req.user.role === 'agent') {
      const [orders] = await pool.execute(
        'SELECT agent_id FROM orders WHERE id = ?',
        [orderId]
      );

      if (orders.length === 0 || orders[0].agent_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized to view this order history' });
      }
    }

    // Get location history
    const [locations] = await pool.execute(
      'SELECT * FROM delivery_locations WHERE order_id = ? ORDER BY timestamp ASC',
      [orderId]
    );

    res.json(locations);
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ error: 'Failed to get location history' });
  }
});

export default router;