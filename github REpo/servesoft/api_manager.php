<?php
session_start();
require 'config.php';
require 'session_helper.php';

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

requireAuth();
$userId = $_SESSION['user_id'];
$roles = requireRole($conn, $userId, 'manager');

$managerId = null;
$restaurantId = null;
foreach ($roles as $role) {
    if ($role['type'] === 'manager') {
        $managerId = $role['id'];
        $restaurantId = $role['restaurantId'];
        break;
    }
}

if (!$managerId || !$restaurantId) {
    http_response_code(403);
    echo json_encode(['error' => 'Manager role not found']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'get_orders':
            $status = $_GET['status'] ?? 'ALL';
            $type = $_GET['type'] ?? 'ALL';

            $sql = 'SELECT o.OrderID, o.CustomerID, o.OrderDate, o.OrderType, o.OrderStatus, o.DeliveryAddress, u.Name AS CustomerName FROM CustomerOrder o INNER JOIN Customer c ON o.CustomerID = c.CustomerID INNER JOIN User u ON c.UserID = u.UserID WHERE o.RestaurantID = ?';
            $params = [$restaurantId];
            $types = 'i';

            if ($status !== 'ALL') {
                $sql .= ' AND o.OrderStatus = ?';
                $params[] = $status;
                $types .= 's';
            }
            if ($type !== 'ALL') {
                $sql .= ' AND o.OrderType = ?';
                $params[] = $type;
                $types .= 's';
            }
            $sql .= ' ORDER BY o.OrderDate DESC';

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                $orders[] = [
                    'id' => $row['OrderID'],
                    'customerId' => $row['CustomerID'],
                    'customerName' => $row['CustomerName'],
                    'date' => $row['OrderDate'],
                    'type' => $row['OrderType'],
                    'status' => $row['OrderStatus'],
                    'deliveryAddress' => $row['DeliveryAddress']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'orders' => $orders]);
            break;

        case 'update_order_status':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $orderId = intval($data['order_id'] ?? 0);
            $newStatus = $data['status'] ?? '';

            $stmt = $conn->prepare('UPDATE CustomerOrder SET OrderStatus = ? WHERE OrderID = ? AND RestaurantID = ?');
            $stmt->bind_param('sii', $newStatus, $orderId, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Order status updated']);
            break;

        case 'get_tables':
            $stmt = $conn->prepare('SELECT TableID, TableNumber, Capacity, Status FROM RestaurantTable WHERE RestaurantID = ? ORDER BY TableNumber');
            $stmt->bind_param('i', $restaurantId);
            $stmt->execute();
            $result = $stmt->get_result();
            $tables = [];
            while ($row = $result->fetch_assoc()) {
                $tables[] = [
                    'id' => $row['TableID'],
                    'number' => intval($row['TableNumber']),
                    'capacity' => intval($row['Capacity']),
                    'status' => $row['Status']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'tables' => $tables]);
            break;

        case 'update_table_status':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $tableId = intval($data['table_id'] ?? 0);
            $newStatus = $data['status'] ?? '';

            $stmt = $conn->prepare('UPDATE RestaurantTable SET Status = ? WHERE TableID = ? AND RestaurantID = ?');
            $stmt->bind_param('sii', $newStatus, $tableId, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Table status updated']);
            break;

        case 'get_menu':
            $stmt = $conn->prepare('SELECT MenuID, ItemName, ItemDescription, Category, Price, Availability FROM MenuItem WHERE RestaurantID = ? ORDER BY Category, ItemName');
            $stmt->bind_param('i', $restaurantId);
            $stmt->execute();
            $result = $stmt->get_result();
            $items = [];
            while ($row = $result->fetch_assoc()) {
                $items[] = [
                    'id' => $row['MenuID'],
                    'name' => $row['ItemName'],
                    'description' => $row['ItemDescription'],
                    'category' => $row['Category'],
                    'price' => floatval($row['Price']),
                    'available' => boolval($row['Availability'])
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'menu' => $items]);
            break;

        case 'add_menu_item':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $name = $data['name'] ?? '';
            $description = $data['description'] ?? '';
            $category = $data['category'] ?? '';
            $price = floatval($data['price'] ?? 0);
            $available = boolval($data['available'] ?? true);

            $stmt = $conn->prepare('INSERT INTO MenuItem (RestaurantID, ItemName, ItemDescription, Category, Price, Availability) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->bind_param('isssdi', $restaurantId, $name, $description, $category, $price, $available);
            $stmt->execute();
            $menuId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'menu_id' => $menuId, 'message' => 'Menu item added']);
            break;

        case 'update_menu_item':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $menuId = intval($data['menu_id'] ?? 0);
            $name = $data['name'] ?? '';
            $description = $data['description'] ?? '';
            $category = $data['category'] ?? '';
            $price = floatval($data['price'] ?? 0);
            $available = boolval($data['available'] ?? true);

            $stmt = $conn->prepare('UPDATE MenuItem SET ItemName = ?, ItemDescription = ?, Category = ?, Price = ?, Availability = ? WHERE MenuID = ? AND RestaurantID = ?');
            $stmt->bind_param('sssdiid', $name, $description, $category, $price, $available, $menuId, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Menu item updated']);
            break;

        case 'delete_menu_item':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $menuId = intval($data['menu_id'] ?? 0);

            $stmt = $conn->prepare('DELETE FROM MenuItem WHERE MenuID = ? AND RestaurantID = ?');
            $stmt->bind_param('ii', $menuId, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Menu item deleted']);
            break;

        case 'get_reservations':
            $stmt = $conn->prepare('SELECT r.ReservationID, r.TableID, r.CustomerID, r.ReservationDate, r.NumberOfGuests, r.Status, t.TableNumber, u.Name AS CustomerName FROM Reservation r INNER JOIN RestaurantTable t ON r.TableID = t.TableID INNER JOIN Customer c ON r.CustomerID = c.CustomerID INNER JOIN User u ON c.UserID = u.UserID WHERE t.RestaurantID = ? ORDER BY r.ReservationDate DESC');
            $stmt->bind_param('i', $restaurantId);
            $stmt->execute();
            $result = $stmt->get_result();
            $reservations = [];
            while ($row = $result->fetch_assoc()) {
                $reservations[] = [
                    'id' => $row['ReservationID'],
                    'tableId' => $row['TableID'],
                    'tableNumber' => intval($row['TableNumber']),
                    'customerId' => $row['CustomerID'],
                    'customerName' => $row['CustomerName'],
                    'date' => $row['ReservationDate'],
                    'guests' => intval($row['NumberOfGuests']),
                    'status' => $row['Status']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'reservations' => $reservations]);
            break;

        case 'update_reservation_status':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $reservationId = intval($data['reservation_id'] ?? 0);
            $newStatus = $data['status'] ?? '';

            $stmt = $conn->prepare('UPDATE Reservation SET Status = ? WHERE ReservationID = ?');
            $stmt->bind_param('si', $newStatus, $reservationId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Reservation status updated']);
            break;

        case 'get_staff':
            $stmt = $conn->prepare('SELECT s.StaffID, s.UserID, s.Role, s.DateHired, s.Salary, s.Status, u.Name, u.Email, u.PhoneNumber FROM RestaurantStaff s INNER JOIN User u ON s.UserID = u.UserID WHERE s.RestaurantID = ? ORDER BY u.Name');
            $stmt->bind_param('i', $restaurantId);
            $stmt->execute();
            $result = $stmt->get_result();
            $staff = [];
            while ($row = $result->fetch_assoc()) {
                $staff[] = [
                    'id' => $row['StaffID'],
                    'userId' => $row['UserID'],
                    'name' => $row['Name'],
                    'email' => $row['Email'],
                    'phone' => $row['PhoneNumber'],
                    'role' => $row['Role'],
                    'dateHired' => $row['DateHired'],
                    'salary' => floatval($row['Salary']),
                    'status' => $row['Status']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'staff' => $staff]);
            break;

        case 'update_staff_status':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $staffId = intval($data['staff_id'] ?? 0);
            $newStatus = $data['status'] ?? '';

            $stmt = $conn->prepare('UPDATE RestaurantStaff SET Status = ? WHERE StaffID = ? AND RestaurantID = ?');
            $stmt->bind_param('sii', $newStatus, $staffId, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Staff status updated']);
            break;

        case 'assign_delivery':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $orderId = intval($data['order_id'] ?? 0);
            $driverStaffId = intval($data['driver_staff_id'] ?? 0);

            $stmt = $conn->prepare('SELECT DeliveryAgentID FROM DeliveryAgent WHERE StaffID = ?');
            $stmt->bind_param('i', $driverStaffId);
            $stmt->execute();
            $result = $stmt->get_result();
            $driver = $result->fetch_assoc();
            $stmt->close();

            if (!$driver) {
                http_response_code(400);
                echo json_encode(['error' => 'Driver not found']);
                break;
            }

            $deliveryAgentId = $driver['DeliveryAgentID'];

            $stmt = $conn->prepare('SELECT DeliveryID FROM Delivery WHERE OrderID = ?');
            $stmt->bind_param('i', $orderId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                $stmt = $conn->prepare('UPDATE Delivery SET DeliveryAgentID = ?, Status = ? WHERE DeliveryID = ?');
                $status = 'ASSIGNED';
                $stmt->bind_param('isi', $deliveryAgentId, $status, $existing['DeliveryID']);
                $stmt->execute();
                $stmt->close();
            } else {
                $stmt = $conn->prepare('SELECT DeliveryAddress FROM CustomerOrder WHERE OrderID = ?');
                $stmt->bind_param('i', $orderId);
                $stmt->execute();
                $result = $stmt->get_result();
                $order = $result->fetch_assoc();
                $stmt->close();

                $pickupLocation = 'Restaurant';
                $status = 'ASSIGNED';
                $stmt = $conn->prepare('INSERT INTO Delivery (OrderID, DeliveryAgentID, PickupLocation, Status) VALUES (?, ?, ?, ?)');
                $stmt->bind_param('iiss', $orderId, $deliveryAgentId, $pickupLocation, $status);
                $stmt->execute();
                $stmt->close();
            }

            echo json_encode(['success' => true, 'message' => 'Delivery assigned']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
