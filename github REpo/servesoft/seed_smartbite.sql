-- SMARTBITE Database Seed Data
-- Insert a sample restaurant first

INSERT INTO Restaurant (RestaurantName, Address, ContactNumber, Location, Status)
VALUES ('Mama Fifi''s Kitchen', '123 Commercial Avenue, Douala', '+237 680 111 222', 'Douala', 'Active');

-- Get the restaurant ID (assuming it's 1 if this is first insert)
-- If you need to add menu items, you can do:

INSERT INTO MenuItem (RestaurantID, ItemName, ItemDescription, Price, Availability) VALUES
(1, 'Ndole with Plantains', 'Traditional Cameroonian bitterleaf stew with boiled plantains', 2500, TRUE),
(1, 'Jollof Rice with Chicken', 'Flavorful jollof rice served with grilled chicken', 3000, TRUE),
(1, 'Pepper Soup', 'Spicy traditional pepper soup with fish', 1500, TRUE),
(1, 'Koki with Fried Fish', 'Steamed bean cake served with crispy fried fish', 2000, TRUE),
(1, 'Eru with Garri', 'Traditional eru vegetable dish with garri', 2200, TRUE);

-- Add some tables for the restaurant
INSERT INTO RestaurantTable (RestaurantID, TableNumber, Capacity, Status) VALUES
(1, 1, 4, 'Available'),
(1, 2, 2, 'Available'),
(1, 3, 6, 'Available'),
(1, 4, 4, 'Available'),
(1, 5, 8, 'Available');
