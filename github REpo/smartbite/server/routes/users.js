import express from 'express';
import { pool } from '../config/database.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { role, town, search } = req.query;
    
    let query = 'SELECT user_id as id, name, email, role, phone_number as phone, town, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (town) {
      query += ' AND town = ?';
      params.push(town);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    console.log('🔄 Fetching users with query:', query);
    const [users] = await pool.execute(query, params);
    console.log(`✅ Found ${users.length} users`);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT user_id as id, name, email, role, phone_number as phone, town, is_active, created_at FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, town } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) { updateFields.push('name = ?'); updateValues.push(name); }
    if (phone !== undefined) { updateFields.push('phone_number = ?'); updateValues.push(phone); }
    if (town !== undefined) { updateFields.push('town = ?'); updateValues.push(town); }

    if (updateFields.length > 0) {
      updateValues.push(req.user.id);
      await pool.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
        updateValues
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Toggle user status (admin only)
router.put('/:id/toggle-status', requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('🔄 Toggling status for user:', userId);
    
    await pool.execute(
      'UPDATE users SET is_active = NOT is_active WHERE user_id = ?',
      [userId]
    );

    console.log('✅ User status toggled successfully');
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('❌ Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    console.log('🔄 Deleting user:', userId);

    // Don't allow deleting admin users
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin users' });
    }

    await pool.execute('DELETE FROM users WHERE user_id = ?', [userId]);

    console.log('✅ User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;