# SERVESOFT - Restaurant Ordering & Management System

A lightweight restaurant system that lets guests order quickly and helps managers run daily operations from one place.

## System Overview

SERVESOFT is a complete restaurant management platform with role-based access:

- **Customers**: Browse menu, manage cart, place orders, create reservations
- **Restaurant Managers**: Manage orders, floor plan/tables, menu items, reservations, and staff
- **Delivery Drivers**: Accept/decline delivery jobs, update delivery milestones
- **Admins**: Platform-wide provisioning, manage restaurants and user roles

## Database Schema

The system uses your existing MySQL database named `SERVESOFT` with the following tables:
- User, Account, Customer, Admin
- Restaurant, RestaurantStaff, RestaurantManager, DeliveryAgent
- RestaurantTable, Reservation, MenuItem
- Cart, CartItem, CustomerOrder, OrderItem
- Payment, Delivery

## Getting Started

### 1. Initial Setup

Run the seed data script to populate sample restaurant, menu items, and tables:

```bash
php seed_data.php
```

### 2. Register Users

Visit `register.php` to create accounts. By default, new registrations create Customer accounts.

### 3. Login

Visit `auth.php` to login. After login, you'll be redirected to `hello.php` which shows a role-based dashboard.

### 4. View Database

Visit `views.php` to see all database tables and their current data.

## API Endpoints

### Customer API (`api_customer.php`)

**Get Menu:**
```
GET api_customer.php?action=get_menu&restaurant_id=1
```

**Get Cart:**
```
GET api_customer.php?action=get_cart
```

**Add to Cart:**
```
POST api_customer.php
Content-Type: application/json

{
  "action": "add_to_cart",
  "menu_id": 1,
  "quantity": 2
}
```

**Remove from Cart:**
```
POST api_customer.php
Content-Type: application/json

{
  "action": "remove_from_cart",
  "cart_item_id": 1
}
```

**Place Order:**
```
POST api_customer.php
Content-Type: application/json

{
  "action": "place_order",
  "restaurant_id": 1,
  "order_type": "DINE_IN",
  "delivery_address": null
}
```

**Get Orders:**
```
GET api_customer.php?action=get_orders
```

**Get Reservations:**
```
GET api_customer.php?action=get_reservations
```

**Create Reservation:**
```
POST api_customer.php
Content-Type: application/json

{
  "action": "create_reservation",
  "table_id": 1,
  "reservation_date": "2025-10-15 18:00:00",
  "number_of_guests": 4
}
```

### Manager API (`api_manager.php`)

**Get Orders:**
```
GET api_manager.php?action=get_orders&status=ALL&type=ALL
```

**Update Order Status:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "update_order_status",
  "order_id": 1,
  "status": "IN_PREP"
}
```

**Get Tables:**
```
GET api_manager.php?action=get_tables
```

**Update Table Status:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "update_table_status",
  "table_id": 1,
  "status": "SEATED"
}
```

**Get Menu:**
```
GET api_manager.php?action=get_menu
```

**Add Menu Item:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "add_menu_item",
  "name": "New Dish",
  "description": "Description here",
  "category": "Mains",
  "price": 15.99,
  "available": true
}
```

**Update Menu Item:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "update_menu_item",
  "menu_id": 1,
  "name": "Updated Name",
  "description": "Updated description",
  "category": "Starters",
  "price": 12.99,
  "available": true
}
```

**Delete Menu Item:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "delete_menu_item",
  "menu_id": 1
}
```

**Get Reservations:**
```
GET api_manager.php?action=get_reservations
```

**Update Reservation Status:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "update_reservation_status",
  "reservation_id": 1,
  "status": "CONFIRMED"
}
```

**Get Staff:**
```
GET api_manager.php?action=get_staff
```

**Update Staff Status:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "update_staff_status",
  "staff_id": 1,
  "status": "INACTIVE"
}
```

**Assign Delivery:**
```
POST api_manager.php
Content-Type: application/json

{
  "action": "assign_delivery",
  "order_id": 1,
  "driver_staff_id": 2
}
```

### Driver API (`api_driver.php`)

**Get Deliveries:**
```
GET api_driver.php?action=get_deliveries&status=ALL
```

**Accept Delivery:**
```
POST api_driver.php
Content-Type: application/json

{
  "action": "accept_delivery",
  "delivery_id": 1
}
```

**Decline Delivery:**
```
POST api_driver.php
Content-Type: application/json

{
  "action": "decline_delivery",
  "delivery_id": 1
}
```

**Update Delivery Milestone:**
```
POST api_driver.php
Content-Type: application/json

{
  "action": "update_delivery_milestone",
  "delivery_id": 1,
  "milestone": "PICKED_UP"
}
```

Valid milestones: `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`

### Admin API (`api_admin.php`)

**Get Restaurants:**
```
GET api_admin.php?action=get_restaurants
```

**Create Restaurant:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "create_restaurant",
  "name": "New Restaurant",
  "address": "123 Main St",
  "phone": "555-0000",
  "location": "Downtown",
  "status": "ACTIVE"
}
```

**Update Restaurant:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "update_restaurant",
  "restaurant_id": 1,
  "name": "Updated Name",
  "address": "456 Oak Ave",
  "phone": "555-1111",
  "location": "Uptown",
  "status": "ACTIVE"
}
```

**Get Users:**
```
GET api_admin.php?action=get_users&role=ALL
```

Role filter options: `ALL`, `CUSTOMER`, `ADMIN`, `STAFF`

**Get User Roles:**
```
GET api_admin.php?action=get_user_roles&user_id=1
```

**Assign Customer Role:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "assign_customer_role",
  "user_id": 2
}
```

**Assign Admin Role:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "assign_admin_role",
  "user_id": 2
}
```

**Assign Staff Role:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "assign_staff_role",
  "user_id": 2,
  "restaurant_id": 1,
  "role": "SERVER",
  "salary": 35000
}
```

**Assign Manager Role:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "assign_manager_role",
  "staff_id": 1
}
```

**Assign Driver Role:**
```
POST api_admin.php
Content-Type: application/json

{
  "action": "assign_driver_role",
  "staff_id": 2
}
```

**Get All Orders:**
```
GET api_admin.php?action=get_all_orders
```

## Order Status Flow

Text-only status timeline:
1. `RECEIVED` - Order placed by customer
2. `IN_PREP` - Kitchen preparing order
3. `READY` - Order ready for pickup/delivery
4. `COMPLETED` - Order fulfilled
5. `CANCELLED` - Order cancelled

## Order Types

- `DINE_IN` - Customer orders at table (QR code entry)
- `PRE_ORDER` - Customer pre-orders for pickup
- `DELIVERY` - Customer orders for delivery

## Table States

- `FREE` - Available for seating
- `HELD` - Reserved but not yet seated
- `SEATED` - Currently occupied
- `CLEANING` - Being cleaned

## File Structure

```
Hoping final/
├── auth.php              # Login page
├── register.php          # Registration page
├── hello.php             # Role-based dashboard
├── logout.php            # Logout handler
├── views.php             # Database viewer
├── config.php            # Database connection
├── session_helper.php    # Role detection helper
├── api_customer.php      # Customer API endpoints
├── api_manager.php       # Manager API endpoints
├── api_driver.php        # Driver API endpoints
├── api_admin.php         # Admin API endpoints
├── bootstrap.php         # Initial data loader
├── seed_data.php         # Sample data seeder
├── styles.css            # Application styles
└── README_SERVESOFT.md   # This file
```

## Security Features

- Password hashing with PHP's `password_hash()`
- Prepared statements to prevent SQL injection
- Role-based access control
- Session-based authentication
- Input validation and sanitization

## Testing the System

1. **As Customer:**
   - Register a new account
   - Login and see customer dashboard
   - Browse menu via API
   - Add items to cart
   - Place an order

2. **As Manager:**
   - Admin must assign manager role first
   - View and update order statuses
   - Manage tables and floor plan
   - Edit menu items
   - Manage staff

3. **As Driver:**
   - Admin must assign driver role to a staff member
   - View assigned deliveries
   - Accept/decline jobs
   - Update delivery milestones

4. **As Admin:**
   - Admin must assign admin role to a user
   - Manage restaurants
   - Assign roles to users
   - View system-wide data

## Notes

- No online payment processing (kept simple for thesis)
- No push notifications (text-only status updates)
- No map tracking (lightweight design)
- Single codebase with PHP backend
- Ideal for thesis/demonstration purposes
