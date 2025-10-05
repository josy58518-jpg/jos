# SMARTBITE Database Setup Instructions

## Database Configuration Complete

The application has been updated to connect to your SMARTBITE database in XAMPP.

## What Was Changed

1. **config.php** - Updated to connect to SMARTBITE database instead of SERVESOFT
2. **api_auth.php** - Completely rewritten to work with SMARTBITE schema
   - User table now stores passwords directly (no separate Account table)
   - Role detection works with Admin, Customer, Restaurant_Manager, and DeliveryAgent tables
   - Registration creates proper records in all relevant tables

3. **bootstrap.php** - Updated column names to match SMARTBITE schema
   - Uses ContactNumber instead of PhoneNumber
   - Removed Category column from MenuItem queries (not in your schema)

## Initial Data Setup

To populate your database with sample data, run this SQL in phpMyAdmin:

```sql
-- Insert a sample restaurant
INSERT INTO Restaurant (RestaurantName, Address, ContactNumber, Location, Status)
VALUES ('Mama Fifi''s Kitchen', '123 Commercial Avenue, Douala', '+237 680 111 222', 'Douala', 'Active');

-- Add menu items (assuming RestaurantID = 1)
INSERT INTO MenuItem (RestaurantID, ItemName, ItemDescription, Price, Availability) VALUES
(1, 'Ndole with Plantains', 'Traditional Cameroonian bitterleaf stew with boiled plantains', 2500, TRUE),
(1, 'Jollof Rice with Chicken', 'Flavorful jollof rice served with grilled chicken', 3000, TRUE),
(1, 'Pepper Soup', 'Spicy traditional pepper soup with fish', 1500, TRUE),
(1, 'Koki with Fried Fish', 'Steamed bean cake served with crispy fried fish', 2000, TRUE),
(1, 'Eru with Garri', 'Traditional eru vegetable dish with garri', 2200, TRUE);

-- Add tables
INSERT INTO RestaurantTable (RestaurantID, TableNumber, Capacity, Status) VALUES
(1, 1, 4, 'Available'),
(1, 2, 2, 'Available'),
(1, 3, 6, 'Available');
```

## Testing Registration

The 409 Conflict error you saw means a user with that email already exists. Try:

1. Use a different email address
2. Or clear the User table: `DELETE FROM User;` in phpMyAdmin

## User Roles

When registering, you can choose:
- **customer** - Orders food
- **owner** - Manages restaurants (creates Restaurant_Manager record)
- **agent** - Delivers food (creates DeliveryAgent record)
- **admin** - Platform administrator (only one allowed)

## Troubleshooting

If you still see errors:
1. Verify XAMPP Apache and MySQL are running
2. Verify SMARTBITE database exists in phpMyAdmin
3. Check that all tables from your schema are created
4. Clear browser cache and localStorage
