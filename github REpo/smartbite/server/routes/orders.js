import express from 'express';
import { pool } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get orders for customer
router.get('/customer', requireRole(['customer']), async (req, res) => {
  try {
    console.log(`🛒 Fetching orders for customer ${req.user.id}`);
    
    const [orders] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name, r.image as restaurant_image
       FROM orders o
       JOIN restaurants_info r ON o.restaurant_id = r.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, mi.item_name as name, mi.image
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.menu_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items.map(item => ({
        id: item.id.toString(),
        menu_item_id: item.menu_item_id.toString(),
        quantity: item.quantity,
        price: parseFloat(item.price),
        name: item.name,
        image: item.image
      }));
    }

    const formattedOrders = orders.map(order => ({
      id: order.id.toString(),
      customer_id: order.customer_id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      restaurant_name: order.restaurant_name,
      restaurant_image: order.restaurant_image,
      total: parseFloat(order.total_amount), // Use total_amount column
      status: order.status,
      delivery_address: order.delivery_address,
      customer_phone: order.customer_phone,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      agent_id: order.agent_id?.toString(),
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.items
    }));

    console.log(`✅ Found ${formattedOrders.length} orders for customer`);
    res.json(formattedOrders);
  } catch (error) {
    console.error('❌ Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for restaurant
router.get('/restaurant', requireRole(['owner']), async (req, res) => {
  try {
    // Get restaurant ID for this owner
    const [restaurants] = await pool.execute(
      'SELECT id FROM restaurants_info WHERE user_id = ?',
      [req.user.id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ error: 'No restaurant found for this owner' });
    }

    const restaurantId = restaurants[0].id;
    console.log(`🏪 Fetching orders for restaurant ${restaurantId}`);

    const [orders] = await pool.execute(
      `SELECT o.*, u.name as customer_name, u.phone_number as customer_phone
       FROM orders o
       JOIN users u ON o.customer_id = u.user_id
       WHERE o.restaurant_id = ?
       ORDER BY o.created_at DESC`,
      [restaurantId]
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, mi.item_name as name, mi.image
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.menu_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    console.log(`✅ Found ${orders.length} orders for restaurant`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Get restaurant orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get available deliveries for agents
router.get('/available-deliveries', requireRole(['agent']), async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name, r.address as restaurant_address,
              u.name as customer_name
       FROM orders o
       JOIN restaurants_info r ON o.restaurant_id = r.id
       JOIN users u ON o.customer_id = u.user_id
       WHERE o.status = 'ready' AND o.agent_id IS NULL
       ORDER BY o.created_at ASC`
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, mi.item_name as name
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.menu_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    console.log(`✅ Found ${orders.length} available deliveries`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Get available deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch available deliveries' });
  }
});

// Get agent's deliveries
router.get('/agent', requireRole(['agent']), async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, r.name as restaurant_name, r.address as restaurant_address,
              u.name as customer_name
       FROM orders o
       JOIN restaurants_info r ON o.restaurant_id = r.id
       JOIN users u ON o.customer_id = u.user_id
       WHERE o.agent_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Get order items for each order
    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, mi.item_name as name
         FROM order_items oi
         JOIN menu_items mi ON oi.menu_item_id = mi.menu_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    console.log(`✅ Found ${orders.length} orders for agent`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Get agent orders error:', error);
    res.status(500).json({ error: 'Failed to fetch agent orders' });
  }
});

// Create order
router.post('/', requireRole(['customer']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      restaurant_id,
      items,
      delivery_address,
      customer_phone,
      payment_method = 'cash'
    } = req.body;

    console.log('🛒 Creating order:', { 
      restaurant_id, 
      items: items?.length, 
      customer_id: req.user.id,
      delivery_address: delivery_address?.substring(0, 50) + '...',
      customer_phone 
    });

    // Comprehensive validation
    const errors = [];
    if (!restaurant_id || isNaN(Number(restaurant_id))) {
      errors.push('Valid restaurant ID is required');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('Order items are required');
    }
    if (!delivery_address?.trim()) {
      errors.push('Delivery address is required');
    }
    if (!customer_phone?.trim()) {
      errors.push('Customer phone number is required');
    }

    // Validate each item
    if (items && Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.menu_item_id || isNaN(Number(item.menu_item_id))) {
          errors.push(`Item ${i + 1}: Valid menu item ID is required`);
        }
        if (!item.quantity || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
          errors.push(`Item ${i + 1}: Valid quantity is required`);
        }
      }
    }

    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Verify restaurant exists and is active
    const [restaurants] = await connection.execute(
      'SELECT id, name, is_active FROM restaurants_info WHERE id = ?',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!restaurants[0].is_active) {
      await connection.rollback();
      return res.status(400).json({ error: 'Restaurant is currently not accepting orders' });
    }

    // Calculate total and validate items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItemId = Number(item.menu_item_id);
      const quantity = Number(item.quantity);

      const [menuItems] = await connection.execute(
        'SELECT menu_id, item_name, item_price, restaurant_id FROM menu_items WHERE menu_id = ? AND is_available = true',
        [menuItemId]
      );

      if (menuItems.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Menu item ${menuItemId} is not available` });
      }

      const menuItem = menuItems[0];

      // Verify item belongs to the correct restaurant
      if (menuItem.restaurant_id !== Number(restaurant_id)) {
        await connection.rollback();
        return res.status(400).json({ error: `Menu item ${menuItemId} does not belong to this restaurant` });
      }

      const itemTotal = menuItem.item_price * quantity;
      total += itemTotal;
      
      orderItems.push({
        menu_item_id: menuItem.menu_id,
        quantity: quantity,
        price: menuItem.item_price,
        item_name: menuItem.item_name
      });
    }

    console.log(`💰 Order total calculated: ${total} XAF for ${orderItems.length} items`);

    // Create order - Use total_amount column
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (customer_id, restaurant_id, total_amount, delivery_address, customer_phone, payment_method)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, restaurant_id, total, delivery_address.trim(), customer_phone.trim(), payment_method]
    );

    const orderId = orderResult.insertId;
    console.log(`✅ Order created with ID: ${orderId}`);

    // Insert order items
    for (const item of orderItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price, item_name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.menu_item_id, item.quantity, item.price, item.item_name]
      );
    }

    await connection.commit();
    console.log(`🎉 Order ${orderId} completed successfully with ${orderItems.length} items`);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new-order', {
        orderId,
        restaurantId: restaurant_id,
        customerId: req.user.id,
        total,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId: orderId.toString(),
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Create order error:', error);
    
    // Provide more specific error messages
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'Invalid restaurant or menu item reference' });
    } else if (error.code === 'ER_BAD_NULL_ERROR') {
      res.status(400).json({ error: 'Missing required order information' });
    } else {
      res.status(500).json({ error: 'Failed to create order. Please try again.' });
    }
  } finally {
    connection.release();
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { status, agent_id } = req.body;
    const orderId = req.params.id;

    console.log(`📋 Updating order ${orderId} status to ${status}`);

    // Verify permissions
    const [orders] = await pool.execute(
      `SELECT o.*, r.user_id as owner_id 
       FROM orders o
       JOIN restaurants_info r ON o.restaurant_id = r.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const canUpdate = 
      req.user.role === 'admin' ||
      (req.user.role === 'owner' && order.owner_id === req.user.id) ||
      (req.user.role === 'agent' && (order.agent_id === req.user.id || status === 'in_transit'));

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update order
    const updateFields = ['status = ?'];
    const updateValues = [status];

    if (agent_id !== undefined) {
      updateFields.push('agent_id = ?');
      updateValues.push(agent_id);
    }

    updateValues.push(orderId);

    await pool.execute(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('order-status-update', {
        orderId,
        status,
        restaurantId: order.restaurant_id,
        customerId: order.customer_id,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Accept delivery (agent)
router.put('/:id/accept-delivery', requireRole(['agent']), async (req, res) => {
  try {
    const orderId = req.params.id;

    // Check if order is available for pickup
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND status = ? AND agent_id IS NULL',
      [orderId, 'ready']
    );

    if (orders.length === 0) {
      return res.status(400).json({ error: 'Order not available for pickup' });
    }

    // Assign agent and update status
    await pool.execute(
      'UPDATE orders SET agent_id = ?, status = ? WHERE id = ?',
      [req.user.id, 'in_transit', orderId]
    );

    console.log(`✅ Order ${orderId} accepted by agent ${req.user.id}`);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('order-status-update', {
        orderId,
        status: 'in_transit',
        agentId: req.user.id,
        agentName: req.user.name,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Delivery accepted successfully' });
  } catch (error) {
    console.error('❌ Accept delivery error:', error);
    res.status(500).json({ error: 'Failed to accept delivery' });
  }
});

export default router;