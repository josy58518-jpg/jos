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
$roles = requireRole($conn, $userId, 'admin');

$adminId = null;
foreach ($roles as $role) {
    if ($role['type'] === 'admin') {
        $adminId = $role['id'];
        break;
    }
}

if (!$adminId) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin role not found']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'get_restaurants':
            $stmt = $conn->query('SELECT RestaurantID, RestaurantName, Address, PhoneNumber, Location, Status FROM Restaurant ORDER BY RestaurantName');
            $restaurants = [];
            while ($row = $stmt->fetch_assoc()) {
                $restaurants[] = [
                    'id' => $row['RestaurantID'],
                    'name' => $row['RestaurantName'],
                    'address' => $row['Address'],
                    'phone' => $row['PhoneNumber'],
                    'location' => $row['Location'],
                    'status' => $row['Status']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'restaurants' => $restaurants]);
            break;

        case 'create_restaurant':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $name = $data['name'] ?? '';
            $address = $data['address'] ?? '';
            $phone = $data['phone'] ?? '';
            $location = $data['location'] ?? '';
            $status = $data['status'] ?? 'ACTIVE';

            $stmt = $conn->prepare('INSERT INTO Restaurant (RestaurantName, Address, PhoneNumber, Location, Status) VALUES (?, ?, ?, ?, ?)');
            $stmt->bind_param('sssss', $name, $address, $phone, $location, $status);
            $stmt->execute();
            $restaurantId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'restaurant_id' => $restaurantId, 'message' => 'Restaurant created']);
            break;

        case 'update_restaurant':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $restaurantId = intval($data['restaurant_id'] ?? 0);
            $name = $data['name'] ?? '';
            $address = $data['address'] ?? '';
            $phone = $data['phone'] ?? '';
            $location = $data['location'] ?? '';
            $status = $data['status'] ?? 'ACTIVE';

            $stmt = $conn->prepare('UPDATE Restaurant SET RestaurantName = ?, Address = ?, PhoneNumber = ?, Location = ?, Status = ? WHERE RestaurantID = ?');
            $stmt->bind_param('sssssi', $name, $address, $phone, $location, $status, $restaurantId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Restaurant updated']);
            break;

        case 'get_users':
            $roleFilter = $_GET['role'] ?? 'ALL';

            $sql = 'SELECT u.UserID, u.Name, u.Email, u.PhoneNumber FROM User u';
            $joins = [];

            if ($roleFilter === 'CUSTOMER') {
                $sql .= ' INNER JOIN Customer c ON u.UserID = c.UserID';
            } elseif ($roleFilter === 'ADMIN') {
                $sql .= ' INNER JOIN Admin a ON u.UserID = a.UserID';
            } elseif ($roleFilter === 'STAFF') {
                $sql .= ' INNER JOIN RestaurantStaff s ON u.UserID = s.UserID';
            }

            $sql .= ' ORDER BY u.Name';

            $stmt = $conn->query($sql);
            $users = [];
            while ($row = $stmt->fetch_assoc()) {
                $users[] = [
                    'id' => $row['UserID'],
                    'name' => $row['Name'],
                    'email' => $row['Email'],
                    'phone' => $row['PhoneNumber']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'users' => $users]);
            break;

        case 'get_user_roles':
            $targetUserId = intval($_GET['user_id'] ?? 0);
            $userRoles = getUserRoles($conn, $targetUserId);
            echo json_encode(['success' => true, 'roles' => $userRoles]);
            break;

        case 'assign_customer_role':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $targetUserId = intval($data['user_id'] ?? 0);

            $stmt = $conn->prepare('SELECT CustomerID FROM Customer WHERE UserID = ?');
            $stmt->bind_param('i', $targetUserId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                echo json_encode(['success' => true, 'message' => 'User already has customer role']);
                break;
            }

            $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
            $stmt->bind_param('i', $targetUserId);
            $stmt->execute();
            $customerId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'customer_id' => $customerId, 'message' => 'Customer role assigned']);
            break;

        case 'assign_admin_role':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $targetUserId = intval($data['user_id'] ?? 0);

            $stmt = $conn->prepare('SELECT AdminID FROM Admin WHERE UserID = ?');
            $stmt->bind_param('i', $targetUserId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                echo json_encode(['success' => true, 'message' => 'User already has admin role']);
                break;
            }

            $stmt = $conn->prepare('INSERT INTO Admin (UserID) VALUES (?)');
            $stmt->bind_param('i', $targetUserId);
            $stmt->execute();
            $newAdminId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'admin_id' => $newAdminId, 'message' => 'Admin role assigned']);
            break;

        case 'assign_staff_role':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $targetUserId = intval($data['user_id'] ?? 0);
            $restaurantId = intval($data['restaurant_id'] ?? 0);
            $role = $data['role'] ?? 'STAFF';
            $salary = floatval($data['salary'] ?? 0);

            $stmt = $conn->prepare('INSERT INTO RestaurantStaff (UserID, RestaurantID, Role, DateHired, Salary, Status) VALUES (?, ?, ?, CURDATE(), ?, ?)');
            $status = 'ACTIVE';
            $stmt->bind_param('iisds', $targetUserId, $restaurantId, $role, $salary, $status);
            $stmt->execute();
            $staffId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'staff_id' => $staffId, 'message' => 'Staff role assigned']);
            break;

        case 'assign_manager_role':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $staffId = intval($data['staff_id'] ?? 0);

            $stmt = $conn->prepare('SELECT ManagerID FROM RestaurantManager WHERE StaffID = ?');
            $stmt->bind_param('i', $staffId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                echo json_encode(['success' => true, 'message' => 'Staff already has manager role']);
                break;
            }

            $stmt = $conn->prepare('INSERT INTO RestaurantManager (StaffID) VALUES (?)');
            $stmt->bind_param('i', $staffId);
            $stmt->execute();
            $newManagerId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'manager_id' => $newManagerId, 'message' => 'Manager role assigned']);
            break;

        case 'assign_driver_role':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $staffId = intval($data['staff_id'] ?? 0);

            $stmt = $conn->prepare('SELECT DeliveryAgentID FROM DeliveryAgent WHERE StaffID = ?');
            $stmt->bind_param('i', $staffId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                echo json_encode(['success' => true, 'message' => 'Staff already has driver role']);
                break;
            }

            $stmt = $conn->prepare('INSERT INTO DeliveryAgent (StaffID) VALUES (?)');
            $stmt->bind_param('i', $staffId);
            $stmt->execute();
            $newDriverId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'driver_id' => $newDriverId, 'message' => 'Driver role assigned']);
            break;

        case 'get_all_orders':
            $stmt = $conn->query('SELECT o.OrderID, o.CustomerID, o.RestaurantID, o.OrderDate, o.OrderType, o.OrderStatus, r.RestaurantName, u.Name AS CustomerName FROM CustomerOrder o INNER JOIN Restaurant r ON o.RestaurantID = r.RestaurantID INNER JOIN Customer c ON o.CustomerID = c.CustomerID INNER JOIN User u ON c.UserID = u.UserID ORDER BY o.OrderDate DESC LIMIT 100');
            $orders = [];
            while ($row = $stmt->fetch_assoc()) {
                $orders[] = [
                    'id' => $row['OrderID'],
                    'customerId' => $row['CustomerID'],
                    'customerName' => $row['CustomerName'],
                    'restaurantId' => $row['RestaurantID'],
                    'restaurantName' => $row['RestaurantName'],
                    'date' => $row['OrderDate'],
                    'type' => $row['OrderType'],
                    'status' => $row['OrderStatus']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'orders' => $orders]);
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
