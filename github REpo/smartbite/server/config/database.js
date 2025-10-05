import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables from .env file
dotenv.config();

/**
 * Database Configuration
 * MySQL connection settings with environment variable fallbacks
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartbite_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool for better performance
export const pool = mysql.createPool(dbConfig);

/**
 * Initialize Database
 * Creates database, tables, and sets up initial data structure
 * This function is called when the server starts
 */
export async function initializeDatabase() {
  try {
    console.log(`🔄 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}`);
    
    // Test the connection first
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MySQL database');
    connection.release();

    // Create database if it doesn't exist
    const adminConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await adminConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database ${dbConfig.database} ready`);
    await adminConnection.end();

    // Create all required tables
    await createAllTables();
    
    // NOTE: Removed automatic admin creation - admin must register manually
    console.log('🎉 Database initialization completed successfully');
    console.log('⚠️  No default admin created - register the first admin through the UI');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Create All Database Tables
 * Defines the complete database schema for the SmartBite application
 */
async function createAllTables() {
  try {
    // Users table - Core user information for all user types
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('customer', 'owner', 'agent', 'admin') DEFAULT 'customer',
        phone_number VARCHAR(20),
        town VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_town (town)
      )
    `);
    console.log('✅ Users table ready');

    // Restaurants table - Restaurant information and settings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS restaurants_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500) DEFAULT 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        town VARCHAR(100) NOT NULL,
        address VARCHAR(500) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        delivery_time VARCHAR(50) NOT NULL,
        delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        min_order DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        rating DECIMAL(3,2) DEFAULT 4.5,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_restaurant (user_id),
        INDEX idx_town (town),
        INDEX idx_active (is_active),
        INDEX idx_rating (rating)
      )
    `);
    console.log('✅ Restaurants table ready');

    // Restaurant categories table - Many-to-many relationship for restaurant categories
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS restaurant_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants_info(id) ON DELETE CASCADE,
        UNIQUE KEY unique_restaurant_category (restaurant_id, category),
        INDEX idx_category (category)
      )
    `);
    console.log('✅ Restaurant categories table ready');

    // Menu items table - Individual food items for each restaurant
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        menu_id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        item_price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100) DEFAULT 'Main Course',
        prep_time INT DEFAULT 15,
        is_available BOOLEAN DEFAULT true,
        image VARCHAR(500) DEFAULT 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants_info(id) ON DELETE CASCADE,
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_category (category),
        INDEX idx_available (is_available)
      )
    `);
    console.log('✅ Menu items table ready');

    // Clean up existing orders-related tables to recreate with correct schema
    await pool.execute(`DROP TABLE IF EXISTS order_items`);
    await pool.execute(`DROP TABLE IF EXISTS payments`);
    await pool.execute(`DROP TABLE IF EXISTS delivery_locations`);
    await pool.execute(`DROP TABLE IF EXISTS orders`);
    console.log('🔄 Dropped existing orders-related tables to recreate with correct schema');

    // Orders table - Customer orders with delivery and payment information
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'preparing', 'ready', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
        delivery_address TEXT NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        payment_method ENUM('cash', 'mobile_money') DEFAULT 'cash',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        agent_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants_info(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_customer (customer_id),
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_status (status),
        INDEX idx_agent (agent_id),
        INDEX idx_payment_status (payment_status),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Orders table ready with correct schema');

    // Order items table - Individual items within each order
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10,2) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(menu_id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_menu_item (menu_item_id)
      )
    `);
    console.log('✅ Order items table ready');

    // Payments table - Payment tracking and mobile money integration
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        payment_method ENUM('mobile_money', 'cash') NOT NULL,
        status ENUM('pending', 'successful', 'failed', 'cancelled') DEFAULT 'pending',
        campay_reference VARCHAR(255) NULL,
        campay_external_reference VARCHAR(255) NULL,
        operator VARCHAR(50) NULL,
        operator_reference VARCHAR(255) NULL,
        reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_campay_reference (campay_reference)
      )
    `);
    console.log('✅ Payments table ready');

    // Delivery locations table - GPS tracking for delivery agents
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS delivery_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        agent_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_agent (agent_id),
        INDEX idx_timestamp (timestamp)
      )
    `);
    console.log('✅ Delivery locations table ready');

    // Reviews table - User reviews and ratings for the platform
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_review (user_id),
        INDEX idx_rating (rating),
        INDEX idx_approved (is_approved),
        INDEX idx_created (created_at)
      )
    `);
    console.log('✅ Reviews table ready');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}