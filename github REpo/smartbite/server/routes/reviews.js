import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as user_name, u.role as user_role
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT 50`
    );

    const formattedReviews = reviews.map(review => ({
      id: review.id.toString(),
      user_name: review.user_name,
      user_role: review.user_role,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      updated_at: review.updated_at
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review (authenticated users except admins)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Prevent admins from posting reviews
    if (req.user.role === 'admin') {
      return res.status(403).json({ error: 'Administrators cannot post reviews' });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({ error: 'Comment must be at least 10 characters long' });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({ error: 'Comment must be less than 500 characters' });
    }

    // Check if user already has a review
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE user_id = ?',
      [req.user.id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already posted a review. You can edit your existing review instead.' });
    }

    // Create review
    const [result] = await pool.execute(
      `INSERT INTO reviews (user_id, rating, comment, is_approved)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, rating, comment.trim(), true] // Auto-approve for now
    );

    console.log(`✅ Review created by user ${req.user.id}`);

    res.status(201).json({
      message: 'Review posted successfully',
      reviewId: result.insertId.toString()
    });
  } catch (error) {
    console.error('❌ Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review (own review only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    // Prevent admins from updating reviews
    if (req.user.role === 'admin') {
      return res.status(403).json({ error: 'Administrators cannot update reviews' });
    }

    // Check if review exists and belongs to user
    const [reviews] = await pool.execute(
      'SELECT user_id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (reviews[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (comment && comment.trim().length < 10) {
      return res.status(400).json({ error: 'Comment must be at least 10 characters long' });
    }

    if (comment && comment.trim().length > 500) {
      return res.status(400).json({ error: 'Comment must be less than 500 characters' });
    }

    // Update review
    const updateFields = [];
    const updateValues = [];

    if (rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(rating);
    }

    if (comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(comment.trim());
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(reviewId);

      await pool.execute(
        `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    console.log(`✅ Review ${reviewId} updated by user ${req.user.id}`);

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('❌ Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (own review only or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Check if review exists
    const [reviews] = await pool.execute(
      'SELECT user_id FROM reviews WHERE id = ?',
      [reviewId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check permissions (own review or admin)
    if (req.user.role !== 'admin' && reviews[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    // Delete review
    await pool.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);

    console.log(`✅ Review ${reviewId} deleted by user ${req.user.id}`);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get user's own review
router.get('/my-review', authenticateToken, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.status(403).json({ error: 'Administrators cannot have reviews' });
    }

    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as user_name, u.role as user_role
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.user_id = ?`,
      [req.user.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'No review found' });
    }

    const review = reviews[0];
    const formattedReview = {
      id: review.id.toString(),
      user_name: review.user_name,
      user_role: review.user_role,
      rating: review.rating,
      comment: review.comment,
      is_approved: Boolean(review.is_approved),
      created_at: review.created_at,
      updated_at: review.updated_at
    };

    res.json(formattedReview);
  } catch (error) {
    console.error('❌ Get user review error:', error);
    res.status(500).json({ error: 'Failed to fetch your review' });
  }
});

export default router;