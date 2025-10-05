import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get menu items by restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { category, available } = req.query;
    const restaurantId = req.params.restaurantId;
    
    let query = `
      SELECT menu_id as id, item_name, item_description, item_price, 
             restaurant_id, category, prep_time, is_available, image,
             created_at, updated_at
      FROM menu_items 
      WHERE restaurant_id = ?
    `;
    const params = [restaurantId];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (available !== undefined) {
      query += ' AND is_available = ?';
      params.push(available === 'true');
    }

    query += ' ORDER BY category, item_name';

    console.log(`🍽️  Fetching menu for restaurant ${restaurantId}`);
    const [menuItems] = await pool.execute(query, params);
    console.log(`✅ Found ${menuItems.length} menu items`);
    
    // Transform to match frontend expectations
    const transformedItems = menuItems.map(item => ({
      id: item.id.toString(),
      restaurant_id: item.restaurant_id.toString(),
      item_name: item.item_name,
      item_description: item.item_description || '',
      item_price: parseFloat(item.item_price),
      category: item.category,
      prep_time: item.prep_time || 15,
      is_available: Boolean(item.is_available),
      image: item.image || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('❌ Get menu items error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const [menuItems] = await pool.execute(
      `SELECT menu_id as id, item_name, item_description, item_price, 
              restaurant_id, category, prep_time, is_available, image,
              created_at, updated_at
       FROM menu_items WHERE menu_id = ?`,
      [req.params.id]
    );

    if (menuItems.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const item = menuItems[0];
    const transformedItem = {
      id: item.id.toString(),
      restaurant_id: item.restaurant_id.toString(),
      item_name: item.item_name,
      item_description: item.item_description || '',
      item_price: parseFloat(item.item_price),
      category: item.category,
      prep_time: item.prep_time || 15,
      is_available: Boolean(item.is_available),
      image: item.image || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      created_at: item.created_at,
      updated_at: item.updated_at
    };

    res.json(transformedItem);
  } catch (error) {
    console.error('❌ Get menu item error:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create menu item (owner only)
router.post('/', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const {
      restaurant_id,
      item_name,
      item_description,
      item_price,
      image,
      category,
      prep_time
    } = req.body;

    console.log('🍽️  Creating menu item:', { item_name, restaurant_id, category });

    // Validation
    const errors = [];
    if (!restaurant_id) errors.push('Restaurant ID is required');
    if (!item_name?.trim()) errors.push('Item name is required');
    if (!item_description?.trim()) errors.push('Item description is required');
    if (!item_price || isNaN(Number(item_price)) || Number(item_price) <= 0) {
      errors.push('Valid item price is required');
    }
    if (!category?.trim()) errors.push('Category is required');
    if (prep_time && (isNaN(Number(prep_time)) || Number(prep_time) <= 0)) {
      errors.push('Valid preparation time is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Verify restaurant ownership
    const [restaurants] = await pool.execute(
      'SELECT user_id FROM restaurants_info WHERE id = ?',
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurants[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to add items to this restaurant' });
    }

    // Insert menu item
    const [result] = await pool.execute(
      `INSERT INTO menu_items 
       (restaurant_id, item_name, item_description, item_price, image, category, prep_time, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id,
        item_name.trim(),
        item_description.trim(),
        Number(item_price),
        image?.trim() || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        category.trim(),
        Number(prep_time) || 15,
        true
      ]
    );

    console.log(`✅ Menu item created with ID: ${result.insertId}`);

    res.status(201).json({
      message: 'Menu item created successfully',
      itemId: result.insertId.toString()
    });
  } catch (error) {
    console.error('❌ Create menu item error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item (owner only)
router.put('/:id', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const itemId = req.params.id;

    // Verify ownership
    const [items] = await pool.execute(
      `SELECT mi.*, r.user_id 
       FROM menu_items mi
       JOIN restaurants_info r ON mi.restaurant_id = r.id
       WHERE mi.menu_id = ?`,
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    if (items[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this menu item' });
    }

    const {
      item_name, item_description, item_price, image,
      category, prep_time, is_available
    } = req.body;

    // Build update query
    const updateFields = [];
    const updateValues = [];

    if (item_name !== undefined) { 
      updateFields.push('item_name = ?'); 
      updateValues.push(item_name.trim()); 
    }
    if (item_description !== undefined) { 
      updateFields.push('item_description = ?'); 
      updateValues.push(item_description.trim()); 
    }
    if (item_price !== undefined) { 
      updateFields.push('item_price = ?'); 
      updateValues.push(Number(item_price)); 
    }
    if (image !== undefined) { 
      updateFields.push('image = ?'); 
      updateValues.push(image.trim()); 
    }
    if (category !== undefined) { 
      updateFields.push('category = ?'); 
      updateValues.push(category.trim()); 
    }
    if (prep_time !== undefined) { 
      updateFields.push('prep_time = ?'); 
      updateValues.push(Number(prep_time)); 
    }
    if (is_available !== undefined) { 
      updateFields.push('is_available = ?'); 
      updateValues.push(Boolean(is_available)); 
    }

    if (updateFields.length > 0) {
      updateValues.push(itemId);
      await pool.execute(
        `UPDATE menu_items SET ${updateFields.join(', ')} WHERE menu_id = ?`,
        updateValues
      );
      console.log(`✅ Menu item ${itemId} updated`);
    }

    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('❌ Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (owner only)
router.delete('/:id', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const itemId = req.params.id;

    // Verify ownership
    const [items] = await pool.execute(
      `SELECT mi.*, r.user_id 
       FROM menu_items mi
       JOIN restaurants_info r ON mi.restaurant_id = r.id
       WHERE mi.menu_id = ?`,
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    if (items[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this menu item' });
    }

    await pool.execute('DELETE FROM menu_items WHERE menu_id = ?', [itemId]);
    console.log(`✅ Menu item ${itemId} deleted`);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('❌ Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;