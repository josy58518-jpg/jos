<?php
require 'config.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$response = [
    'restaurants' => [],
    'tables' => [],
    'menuItems' => []
];

try {
    $restaurantQuery = $conn->query('SELECT RestaurantID, RestaurantName, Status, Location, PhoneNumber, Address FROM Restaurant');
    while ($row = $restaurantQuery->fetch_assoc()) {
        $response['restaurants'][] = [
            'id' => 'r' . $row['RestaurantID'],
            'name' => $row['RestaurantName'],
            'status' => $row['Status'] ?? 'ACTIVE',
            'location' => $row['Location'] ?? '',
            'phone' => $row['PhoneNumber'] ?? '',
            'address' => $row['Address'] ?? '',
            'hours' => null,
            'serviceRules' => null
        ];
    }
    $restaurantQuery->close();

    $tableQuery = $conn->query('SELECT TableID, RestaurantID, TableNumber, Capacity, Status FROM RestaurantTable');
    while ($row = $tableQuery->fetch_assoc()) {
        $response['tables'][] = [
            'id' => 't' . $row['TableID'],
            'restaurantId' => 'r' . $row['RestaurantID'],
            'label' => 'Table ' . $row['TableNumber'],
            'capacity' => (int) $row['Capacity'],
            'state' => $row['Status'] ?? 'FREE'
        ];
    }
    $tableQuery->close();

    $menuQuery = $conn->query('SELECT MenuID, RestaurantID, ItemName, ItemDescription, Category, Availability, Price FROM MenuItem');
    while ($row = $menuQuery->fetch_assoc()) {
        $response['menuItems'][] = [
            'id' => 'm' . $row['MenuID'],
            'restaurantId' => 'r' . $row['RestaurantID'],
            'name' => $row['ItemName'],
            'description' => $row['ItemDescription'] ?? '',
            'category' => $row['Category'] ?? 'General',
            'available' => (bool) $row['Availability'],
            'price' => (float) $row['Price'],
            'modifiers' => []
        ];
    }
    $menuQuery->close();

    echo json_encode($response);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to read SERVESOFT data',
        'details' => $error->getMessage()
    ]);
}
?>