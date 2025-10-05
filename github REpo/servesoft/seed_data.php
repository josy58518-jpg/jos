<?php
require 'config.php';

try {
    $conn->begin_transaction();

    echo "Seeding sample data...\n\n";

    $stmt = $conn->query("SELECT RestaurantID FROM Restaurant LIMIT 1");
    $restaurant = $stmt->fetch_assoc();
    $stmt->close();

    if (!$restaurant) {
        echo "Creating sample restaurant...\n";
        $stmt = $conn->prepare("INSERT INTO Restaurant (RestaurantName, Address, PhoneNumber, Location, Status) VALUES (?, ?, ?, ?, ?)");
        $name = "Servesoft Downtown";
        $address = "101 Market Street, Central City";
        $phone = "555-1200";
        $location = "Central City";
        $status = "ACTIVE";
        $stmt->bind_param('sssss', $name, $address, $phone, $location, $status);
        $stmt->execute();
        $restaurantId = $stmt->insert_id;
        $stmt->close();
        echo "Restaurant created with ID: $restaurantId\n";
    } else {
        $restaurantId = $restaurant['RestaurantID'];
        echo "Using existing restaurant with ID: $restaurantId\n";
    }

    $stmt = $conn->query("SELECT MenuID FROM MenuItem WHERE RestaurantID = $restaurantId LIMIT 1");
    $menuItem = $stmt->fetch_assoc();
    $stmt->close();

    if (!$menuItem) {
        echo "\nCreating sample menu items...\n";
        $menuItems = [
            ['Citrus Herb Salad', 'Orange segments, greens, toasted seeds, honey-lime dressing', 'Starters', 9.50],
            ['Smoked Corn Chowder', 'Roasted corn, sweet peppers, coconut milk, charred scallion oil', 'Starters', 7.25],
            ['Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 'Mains', 18.99],
            ['Beef Burger', 'Angus beef patty with lettuce, tomato, cheese', 'Mains', 12.50],
            ['Caesar Salad', 'Romaine lettuce, parmesan, croutons, Caesar dressing', 'Starters', 8.75],
            ['Chocolate Lava Cake', 'Warm chocolate cake with molten center', 'Desserts', 6.50]
        ];

        $stmt = $conn->prepare("INSERT INTO MenuItem (RestaurantID, ItemName, ItemDescription, Category, Price, Availability) VALUES (?, ?, ?, ?, ?, 1)");
        foreach ($menuItems as $item) {
            $stmt->bind_param('isssd', $restaurantId, $item[0], $item[1], $item[2], $item[3]);
            $stmt->execute();
            echo "  - Created: {$item[0]}\n";
        }
        $stmt->close();
    } else {
        echo "\nMenu items already exist.\n";
    }

    $stmt = $conn->query("SELECT TableID FROM RestaurantTable WHERE RestaurantID = $restaurantId LIMIT 1");
    $table = $stmt->fetch_assoc();
    $stmt->close();

    if (!$table) {
        echo "\nCreating sample tables...\n";
        $tables = [
            [1, 4, 'FREE'],
            [2, 2, 'SEATED'],
            [3, 6, 'CLEANING'],
            [4, 4, 'HELD'],
            [5, 8, 'FREE'],
            [6, 2, 'FREE']
        ];

        $stmt = $conn->prepare("INSERT INTO RestaurantTable (RestaurantID, TableNumber, Capacity, Status) VALUES (?, ?, ?, ?)");
        foreach ($tables as $table) {
            $stmt->bind_param('iiis', $restaurantId, $table[0], $table[1], $table[2]);
            $stmt->execute();
            echo "  - Created: Table {$table[0]} (Capacity: {$table[1]})\n";
        }
        $stmt->close();
    } else {
        echo "\nTables already exist.\n";
    }

    $conn->commit();
    echo "\n✓ Sample data seeded successfully!\n";
    echo "\nYou can now:\n";
    echo "1. Register as a customer at register.php\n";
    echo "2. Login and test the customer dashboard\n";
    echo "3. Use views.php to see all database tables\n";

} catch (Exception $e) {
    $conn->rollback();
    echo "✗ Error: " . $e->getMessage() . "\n";
}
?>
