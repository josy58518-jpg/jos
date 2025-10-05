import express from 'express';
import axios from 'axios';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// CamPay Configuration - Updated with correct endpoints
const CAMPAY_CONFIG = {
  app_username: "JByBUneb4BceuEyoMu1nKlmyTgVomd-QfokOrs4t4B9tPJS7hhqUtpuxOx5EQ7zpT0xmYw3P6DU6LU0mH2DvaQ",
  app_password: "m-Xuj9EQIT_zeQ5hSn8hLjYlyJT7KnSTHABYVp7tKeHKgsVnF0x6PEcdtZCVaDM0BN5mX-eylX0fhrGGMZBrWg",
  environment: "PROD" // Use "DEV" for demo mode or "PROD" for live mode
};

// Updated API endpoints - using the correct CamPay API URLs
const CAMPAY_BASE_URL = CAMPAY_CONFIG.environment === "PROD" 
  ? "https://campay.net/api" 
  : "https://demo.campay.net/api";

// Get CamPay access token
async function getCamPayToken() {
  try {
    console.log('🔑 Getting CamPay token from:', `${CAMPAY_BASE_URL}/token/`);
    
    const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
      username: CAMPAY_CONFIG.app_username,
      password: CAMPAY_CONFIG.app_password
    }, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SmartBite-App/1.0'
      }
    });
    
    console.log('✅ CamPay token response:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('❌ CamPay token error:', error.response?.data || error.message);
    
    // If main endpoint fails, try alternative endpoint
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('🔄 Trying alternative CamPay endpoint...');
      try {
        const altResponse = await axios.post('https://api.campay.net/token/', {
          username: CAMPAY_CONFIG.app_username,
          password: CAMPAY_CONFIG.app_password
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SmartBite-App/1.0'
          }
        });
        
        console.log('✅ Alternative CamPay token response:', altResponse.data);
        return altResponse.data.token;
      } catch (altError) {
        console.error('❌ Alternative endpoint also failed:', altError.message);
        throw new Error('CamPay service is currently unavailable. Please try again later.');
      }
    }
    
    throw new Error('Failed to get CamPay access token');
  }
}

// Make payment request to CamPay
async function makeCamPayRequest(token, paymentData) {
  const endpoints = [
    `${CAMPAY_BASE_URL}/collect/`,
    'https://api.campay.net/collect/',
    'https://campay.net/api/collect/'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying payment endpoint: ${endpoint}`);
      
      const response = await axios.post(endpoint, paymentData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SmartBite-App/1.0'
        },
        timeout: 15000 // 15 second timeout for payment requests
      });

      console.log('✅ CamPay payment response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Payment endpoint ${endpoint} failed:`, error.message);
      
      if (endpoints.indexOf(endpoint) === endpoints.length - 1) {
        // This was the last endpoint, throw the error
        throw error;
      }
      // Continue to next endpoint
    }
  }
}

// Initiate payment
router.post('/initiate', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { order_id, phone_number } = req.body;

    console.log('💳 Initiating payment for order:', order_id);

    // Validate input
    if (!order_id || !phone_number) {
      await connection.rollback();
      return res.status(400).json({ error: 'Order ID and phone number are required' });
    }

    // Get order details with proper column name handling
    const [orders] = await connection.execute(
      'SELECT id, customer_id, total_amount, payment_status FROM orders WHERE id = ? AND customer_id = ?',
      [order_id, req.user.id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    
    // Debug log to check order structure
    console.log('📋 Order details:', {
      id: order.id,
      customer_id: order.customer_id,
      total_amount: order.total_amount,
      payment_status: order.payment_status
    });

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      await connection.rollback();
      return res.status(400).json({ error: 'Order is already paid' });
    }

    // Safely get the total amount - handle both possible column names
    let orderTotal = order.total_amount || order.total;
    
    // Additional safety check
    if (!orderTotal || isNaN(Number(orderTotal))) {
      console.error('❌ Invalid order total:', orderTotal);
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid order total amount' });
    }

    // Ensure orderTotal is a number
    orderTotal = Number(orderTotal);
    
    console.log('💰 Order total amount:', orderTotal);

    // Format phone number (ensure it starts with 237)
    let formattedPhone = phone_number.replace(/\D/g, ''); // Remove non-digits
    if (formattedPhone.startsWith('237')) {
      formattedPhone = formattedPhone;
    } else if (formattedPhone.startsWith('6') || formattedPhone.startsWith('2')) {
      formattedPhone = '237' + formattedPhone;
    } else {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    console.log('📱 Formatted phone number:', formattedPhone);

    // Get CamPay token
    const token = await getCamPayToken();

    // Prepare payment request - matching the Python SDK format
    const paymentData = {
      amount: orderTotal.toString(), // Now safely convert to string
      currency: "XAF",
      from: formattedPhone,
      description: `SmartBite Order #${order_id}`,
      external_reference: `SB_${order_id}_${Date.now()}`
    };

    console.log('💰 Payment request data:', paymentData);

    // Make payment request to CamPay
    const paymentResponse = await makeCamPayRequest(token, paymentData);

    // Create payment record
    const [paymentResult] = await connection.execute(
      `INSERT INTO payments 
       (order_id, user_id, amount, phone_number, payment_method, status, campay_reference, campay_external_reference, operator)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        req.user.id,
        orderTotal,
        formattedPhone,
        'mobile_money',
        paymentResponse.status === 'SUCCESSFUL' ? 'successful' : 'pending',
        paymentResponse.reference || null,
        paymentResponse.external_reference || null,
        paymentResponse.operator || null
      ]
    );

    // Update order payment status if successful
    if (paymentResponse.status === 'SUCCESSFUL') {
      await connection.execute(
        'UPDATE orders SET payment_status = ? WHERE id = ?',
        ['paid', order_id]
      );
      console.log('✅ Order payment status updated to paid');
    }

    await connection.commit();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('payment-update', {
        orderId: order_id,
        paymentStatus: paymentResponse.status === 'SUCCESSFUL' ? 'paid' : 'pending',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      payment_id: paymentResult.insertId,
      campay_response: paymentResponse,
      message: paymentResponse.status === 'SUCCESSFUL' 
        ? 'Payment successful!' 
        : 'Payment request sent. Please check your phone to complete the payment.'
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Payment initiation error:', error);
    
    if (error.response?.data) {
      console.error('CamPay API Error:', error.response.data);
      res.status(400).json({ 
        error: error.response.data.message || 'Payment failed',
        details: error.response.data
      });
    } else if (error.message.includes('CamPay service is currently unavailable')) {
      res.status(503).json({ 
        error: 'Payment service is temporarily unavailable. Please try again later or use cash on delivery.',
        fallback: 'cash_on_delivery'
      });
    } else {
      res.status(500).json({ error: 'Payment processing failed. Please try again.' });
    }
  } finally {
    connection.release();
  }
});

// Check payment status
router.get('/status/:orderId', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // Get payment details
    const [payments] = await pool.execute(
      `SELECT p.*, o.total_amount as order_total 
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.order_id = ? AND p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [orderId, req.user.id]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = payments[0];

    // If payment is still pending and we have a CamPay reference, check status
    if (payment.status === 'pending' && payment.campay_reference) {
      try {
        const token = await getCamPayToken();
        
        const statusResponse = await axios.get(
          `${CAMPAY_BASE_URL}/transaction/${payment.campay_reference}/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            },
            timeout: 10000
          }
        );

        console.log('📊 Payment status check:', statusResponse.data);

        // Update payment status if changed
        if (statusResponse.data.status !== payment.status) {
          const newStatus = statusResponse.data.status === 'SUCCESSFUL' ? 'successful' : 
                           statusResponse.data.status === 'FAILED' ? 'failed' : 'pending';

          await pool.execute(
            'UPDATE payments SET status = ?, operator_reference = ?, reason = ? WHERE id = ?',
            [
              newStatus,
              statusResponse.data.operator_reference || payment.operator_reference,
              statusResponse.data.reason || payment.reason,
              payment.id
            ]
          );

          // Update order payment status
          if (newStatus === 'successful') {
            await pool.execute(
              'UPDATE orders SET payment_status = ? WHERE id = ?',
              ['paid', orderId]
            );
          }

          payment.status = newStatus;
        }
      } catch (statusError) {
        console.error('⚠️ Error checking payment status:', statusError.message);
      }
    }

    res.json({
      payment_id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      payment_method: payment.payment_method,
      phone_number: payment.phone_number,
      campay_reference: payment.campay_reference,
      operator: payment.operator,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    });

  } catch (error) {
    console.error('❌ Payment status check error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      `SELECT p.*, o.total_amount as order_total, r.name as restaurant_name
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN restaurants_info r ON o.restaurant_id = r.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      order_id: payment.order_id,
      amount: parseFloat(payment.amount),
      status: payment.status,
      payment_method: payment.payment_method,
      phone_number: payment.phone_number,
      restaurant_name: payment.restaurant_name,
      campay_reference: payment.campay_reference,
      operator: payment.operator,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    }));

    res.json(formattedPayments);

  } catch (error) {
    console.error('❌ Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Webhook for CamPay notifications (optional)
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 CamPay webhook received:', req.body);

    const { reference, status, external_reference } = req.body;

    if (reference && external_reference) {
      // Update payment status
      await pool.execute(
        'UPDATE payments SET status = ? WHERE campay_reference = ?',
        [status === 'SUCCESSFUL' ? 'successful' : 'failed', reference]
      );

      // Update order payment status if successful
      if (status === 'SUCCESSFUL') {
        const [payments] = await pool.execute(
          'SELECT order_id FROM payments WHERE campay_reference = ?',
          [reference]
        );

        if (payments.length > 0) {
          await pool.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            ['paid', payments[0].order_id]
          );
        }
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;