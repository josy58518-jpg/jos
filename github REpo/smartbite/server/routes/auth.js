import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const router = express.Router();

// Check if admin already exists
router.get('/check-admin', async (req, res) => {
  try {
    const [admins] = await pool.execute(
      'SELECT COUNT(*) as admin_count FROM users WHERE role = ?',
      ['admin']
    );
    
    const adminExists = admins[0].admin_count > 0;
    
    res.json({ adminExists });
  } catch (error) {
    console.error('Check admin error:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, town } = req.body;

    // Check if trying to register as admin
    if (role === 'admin') {
      // Check if admin already exists
      const [existingAdmins] = await pool.execute(
        'SELECT user_id FROM users WHERE role = ?',
        ['admin']
      );

      if (existingAdmins.length > 0) {
        return res.status(400).json({ 
          error: 'Admin account already exists. Only one admin account is allowed per system.' 
        });
      }
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, phone_number, town) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'customer', phone, town]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email, role: role || 'customer' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Get user data
    const [users] = await pool.execute(
      'SELECT user_id as id, name, email, role, phone_number as phone, town FROM users WHERE user_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: users[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT user_id as id, name, email, password, role, phone_number as phone, town, is_active FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await pool.execute(
      'SELECT user_id as id, name, email, role, phone_number as phone, town FROM users WHERE user_id = ? AND is_active = true',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;