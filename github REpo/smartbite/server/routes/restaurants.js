import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all restaurants with full data
router.get('/', async (req, res) => {
  try {
    const { town, category, search } = req.query;
    
    let query = `
      SELECT r.*, GROUP_CONCAT(DISTINCT rc.category) as categories
      FROM restaurants_info r
      LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
      WHERE r.is_active = true
    `;
    const params = [];

    if (town) {
      query += ' AND r.town = ?';
      params.push(town);
    }

    if (search) {
      query += ' AND (r.name LIKE ? OR r.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY r.id ORDER BY r.rating DESC, r.created_at DESC';

    console.log('🔍 Fetching restaurants with query:', query);
    const [restaurants] = await pool.execute(query, params);
    console.log(`✅ Found ${restaurants.length} restaurants`);

    // Filter by category if specified
    let filteredRestaurants = restaurants;
    if (category) {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.categories && restaurant.categories.split(',').includes(category)
      );
    }

    // Format response
    const formattedRestaurants = filteredRestaurants.map(restaurant => ({
      id: restaurant.id.toString(),
      user_id: restaurant.user_id.toString(),
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      town: restaurant.town,
      address: restaurant.address,
      phone: restaurant.phone,
      delivery_time: restaurant.delivery_time,
      delivery_fee: parseFloat(restaurant.delivery_fee),
      min_order: parseFloat(restaurant.min_order),
      rating: parseFloat(restaurant.rating),
      is_active: Boolean(restaurant.is_active),
      categories: restaurant.categories ? restaurant.categories.split(',') : [],
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at
    }));

    res.json(formattedRestaurants);
  } catch (error) {
    console.error('❌ Get restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const [restaurants] = await pool.execute(
      `SELECT r.*, GROUP_CONCAT(DISTINCT rc.category) as categories
       FROM restaurants_info r
       LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
       WHERE r.id = ?
       GROUP BY r.id`,
      [req.params.id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const restaurant = restaurants[0];
    const formattedRestaurant = {
      id: restaurant.id.toString(),
      user_id: restaurant.user_id.toString(),
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      town: restaurant.town,
      address: restaurant.address,
      phone: restaurant.phone,
      delivery_time: restaurant.delivery_time,
      delivery_fee: parseFloat(restaurant.delivery_fee),
      min_order: parseFloat(restaurant.min_order),
      rating: parseFloat(restaurant.rating),
      is_active: Boolean(restaurant.is_active),
      categories: restaurant.categories ? restaurant.categories.split(',') : [],
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at
    };

    res.json(formattedRestaurant);
  } catch (error) {
    console.error('❌ Get restaurant error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

// Create restaurant (owner only)
router.post('/', authenticateToken, requireRole(['owner']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      name,
      description,
      image,
      town,
      address,
      phone,
      delivery_time,
      delivery_fee,
      min_order,
      categories
    } = req.body;

    console.log('🏪 Creating restaurant:', { name, town, categories: categories?.length });

    // Comprehensive validation
    const errors = [];
    if (!name?.trim()) errors.push('Restaurant name is required');
    if (!description?.trim()) errors.push('Description is required');
    if (!town) errors.push('Town is required');
    if (!address?.trim()) errors.push('Address is required');
    if (!phone?.trim()) errors.push('Phone number is required');
    if (!delivery_time?.trim()) errors.push('Delivery time is required');
    if (delivery_fee === undefined || isNaN(Number(delivery_fee)) || Number(delivery_fee) < 0) {
      errors.push('Valid delivery fee is required');
    }
    if (min_order === undefined || isNaN(Number(min_order)) || Number(min_order) < 0) {
      errors.push('Valid minimum order amount is required');
    }
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      errors.push('At least one category must be selected');
    }

    if (errors.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: errors.join(', ') });
    }

    // Check if owner already has a restaurant
    const [existingRestaurants] = await connection.execute(
      'SELECT id FROM restaurants_info WHERE user_id = ?',
      [req.user.id]
    );

    if (existingRestaurants.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'You already have a restaurant registered' });
    }

    // Insert restaurant
    const [result] = await connection.execute(
      `INSERT INTO restaurants_info 
       (user_id, name, description, image, town, address, phone, delivery_time, delivery_fee, min_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name.trim(),
        description.trim(),
        image?.trim() || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        town,
        address.trim(),
        phone.trim(),
        delivery_time.trim(),
        Number(delivery_fee),
        Number(min_order)
      ]
    );

    const restaurantId = result.insertId;
    console.log(`✅ Restaurant created with ID: ${restaurantId}`);

    // Insert categories
    for (const category of categories) {
      await connection.execute(
        'INSERT INTO restaurant_categories (restaurant_id, category) VALUES (?, ?)',
        [restaurantId, category.trim()]
      );
    }
    console.log(`✅ Added ${categories.length} categories`);

    await connection.commit();

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurantId: restaurantId.toString()
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Create restaurant error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'You already have a restaurant registered' });
    } else {
      res.status(500).json({ error: 'Failed to create restaurant. Please try again.' });
    }
  } finally {
    connection.release();
  }
});

// Update restaurant
router.put('/:id', authenticateToken, requireRole(['owner', 'admin']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const restaurantId = req.params.id;
    
    // Check ownership (unless admin)
    if (req.user.role !== 'admin') {
      const [restaurants] = await connection.execute(
        'SELECT user_id FROM restaurants_info WHERE id = ?',
        [restaurantId]
      );

      if (restaurants.length === 0 || restaurants[0].user_id !== req.user.id) {
        await connection.rollback();
        return res.status(403).json({ error: 'Not authorized to update this restaurant' });
      }
    }

    const {
      name, description, image, town, address, phone,
      delivery_time, delivery_fee, min_order, categories, is_active
    } = req.body;

    // Update restaurant fields
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name.trim()); }
    if (description !== undefined) { updateFields.push('description = ?'); updateValues.push(description.trim()); }
    if (image !== undefined) { updateFields.push('image = ?'); updateValues.push(image.trim()); }
    if (town !== undefined) { updateFields.push('town = ?'); updateValues.push(town); }
    if (address !== undefined) { updateFields.push('address = ?'); updateValues.push(address.trim()); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone.trim()); }
    if (delivery_time !== undefined) { updateFields.push('delivery_time = ?'); updateValues.push(delivery_time.trim()); }
    if (delivery_fee !== undefined) { updateFields.push('delivery_fee = ?'); updateValues.push(Number(delivery_fee)); }
    if (min_order !== undefined) { updateFields.push('min_order = ?'); updateValues.push(Number(min_order)); }
    if (is_active !== undefined) { updateFields.push('is_active = ?'); updateValues.push(Boolean(is_active)); }

    if (updateFields.length > 0) {
      updateValues.push(restaurantId);
      await connection.execute(
        `UPDATE restaurants_info SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update categories if provided
    if (categories !== undefined && Array.isArray(categories)) {
      await connection.execute(
        'DELETE FROM restaurant_categories WHERE restaurant_id = ?',
        [restaurantId]
      );

      for (const category of categories) {
        await connection.execute(
          'INSERT INTO restaurant_categories (restaurant_id, category) VALUES (?, ?)',
          [restaurantId, category.trim()]
        );
      }
    }

    await connection.commit();
    console.log(`✅ Restaurant ${restaurantId} updated successfully`);

    res.json({ message: 'Restaurant updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Update restaurant error:', error);
    res.status(500).json({ error: 'Failed to update restaurant' });
  } finally {
    connection.release();
  }
});

// Get restaurant by owner
router.get('/owner/my-restaurant', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const [restaurants] = await pool.execute(
      `SELECT r.*, GROUP_CONCAT(DISTINCT rc.category) as categories
       FROM restaurants_info r
       LEFT JOIN restaurant_categories rc ON r.id = rc.restaurant_id
       WHERE r.user_id = ?
       GROUP BY r.id`,
      [req.user.id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ error: 'No restaurant found for this owner' });
    }

    const restaurant = restaurants[0];
    const formattedRestaurant = {
      id: restaurant.id.toString(),
      user_id: restaurant.user_id.toString(),
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      town: restaurant.town,
      address: restaurant.address,
      phone: restaurant.phone,
      delivery_time: restaurant.delivery_time,
      delivery_fee: parseFloat(restaurant.delivery_fee),
      min_order: parseFloat(restaurant.min_order),
      rating: parseFloat(restaurant.rating),
      is_active: Boolean(restaurant.is_active),
      categories: restaurant.categories ? restaurant.categories.split(',') : [],
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at
    };

    console.log(`✅ Retrieved restaurant for owner ${req.user.id}`);
    res.json(formattedRestaurant);
  } catch (error) {
    console.error('❌ Get owner restaurant error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

export default router;