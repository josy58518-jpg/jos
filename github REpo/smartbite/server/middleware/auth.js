import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists and is active
    const [users] = await pool.execute(
      'SELECT user_id as id, name, email, role, town, is_active FROM users WHERE user_id = ? AND is_active = true',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('Role check failed. User role:', req.user?.role, 'Required roles:', roles);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}