<?php
session_start();
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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';

            if (empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password required']);
                exit;
            }

            $stmt = $conn->prepare('SELECT UserID, Name, Email, PhoneNumber, Password FROM User WHERE Email = ?');
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            $stmt->close();

            if (!$user || !password_verify($password, $user['Password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                exit;
            }

            $userId = $user['UserID'];

            // Determine user role
            $primaryRole = 'customer';
            $roleData = null;

            // Check if admin
            $stmt = $conn->prepare('SELECT AdminID FROM Admin WHERE UserID = ?');
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                $primaryRole = 'admin';
                $roleData = ['id' => $result->fetch_assoc()['AdminID']];
            }
            $stmt->close();

            // Check if restaurant manager
            if ($primaryRole === 'customer') {
                $stmt = $conn->prepare('SELECT ManagerID, RestaurantID FROM Restaurant_Manager WHERE UserID = ?');
                $stmt->bind_param('i', $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $managerData = $result->fetch_assoc();
                    $primaryRole = 'owner';
                    $roleData = [
                        'id' => $managerData['ManagerID'],
                        'restaurant_id' => 'r' . $managerData['RestaurantID']
                    ];
                }
                $stmt->close();
            }

            // Check if delivery agent
            if ($primaryRole === 'customer') {
                $stmt = $conn->prepare('SELECT AgentID FROM DeliveryAgent WHERE UserID = ?');
                $stmt->bind_param('i', $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $agentData = $result->fetch_assoc();
                    $primaryRole = 'agent';
                    $roleData = ['id' => $agentData['AgentID']];
                }
                $stmt->close();
            }

            // Check if customer
            if ($primaryRole === 'customer') {
                $stmt = $conn->prepare('SELECT CustomerID FROM Customer WHERE UserID = ?');
                $stmt->bind_param('i', $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    $customerData = $result->fetch_assoc();
                    $roleData = ['id' => $customerData['CustomerID']];
                }
                $stmt->close();
            }

            // Set session
            $_SESSION['user_id'] = $userId;
            $_SESSION['name'] = $user['Name'];
            $_SESSION['email'] = $user['Email'];
            $_SESSION['phone'] = $user['PhoneNumber'];
            $_SESSION['primary_role'] = $primaryRole;
            $_SESSION['role_data'] = $roleData;

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => 'u' . $userId,
                    'name' => $user['Name'],
                    'email' => $user['Email'],
                    'phone' => $user['PhoneNumber'],
                    'role' => $primaryRole,
                    'roleData' => $roleData
                ]
            ]);
            break;

        case 'register':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $name = trim($data['name'] ?? '');
            $phone = trim($data['phone'] ?? '');
            $email = trim($data['email'] ?? '');
            $password = $data['password'] ?? '';
            $confirm = $data['confirm'] ?? $password;
            $role = $data['role'] ?? 'customer';
            $town = trim($data['town'] ?? '');

            // Validation
            if (empty($name) || empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'All required fields must be completed']);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email address']);
                exit;
            }

            if ($password !== $confirm) {
                http_response_code(400);
                echo json_encode(['error' => 'Passwords do not match']);
                exit;
            }

            if (strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['error' => 'Password must be at least 6 characters']);
                exit;
            }

            // Check if admin already exists
            if ($role === 'admin') {
                $stmt = $conn->prepare('SELECT AdminID FROM Admin LIMIT 1');
                $stmt->execute();
                $result = $stmt->get_result();
                if ($result->num_rows > 0) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Admin account already exists']);
                    exit;
                }
                $stmt->close();
            }

            // Check if email already exists
            $stmt = $conn->prepare('SELECT UserID FROM User WHERE Email = ?');
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                exit;
            }
            $stmt->close();

            $conn->begin_transaction();
            try {
                // Create user with password
                $hashed = password_hash($password, PASSWORD_DEFAULT);
                $phoneNumber = !empty($phone) ? $phone : '';
                $stmt = $conn->prepare('INSERT INTO User (Name, PhoneNumber, Email, Password) VALUES (?, ?, ?, ?)');
                $stmt->bind_param('ssss', $name, $phoneNumber, $email, $hashed);
                $stmt->execute();
                $userId = $stmt->insert_id;
                $stmt->close();

                // Create role-specific records
                if ($role === 'customer') {
                    $stmt = $conn->prepare('INSERT INTO Customer (CustomerID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'admin') {
                    $stmt = $conn->prepare('INSERT INTO Admin (AdminID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'owner') {
                    // Owner is a restaurant manager - they also get customer account
                    $stmt = $conn->prepare('INSERT INTO Customer (CustomerID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();

                    // Check if there's at least one restaurant, if not create a placeholder
                    $result = $conn->query('SELECT RestaurantID FROM Restaurant LIMIT 1');
                    if ($result->num_rows === 0) {
                        // Create a placeholder restaurant
                        $conn->query("INSERT INTO Restaurant (RestaurantName, Address, ContactNumber, Location, Status) VALUES ('Pending Setup', 'To be configured', '', '', 'Active')");
                        $restaurantId = $conn->insert_id;
                    } else {
                        $row = $result->fetch_assoc();
                        $restaurantId = $row['RestaurantID'];
                    }

                    $stmt = $conn->prepare('INSERT INTO Restaurant_Manager (ManagerID, UserID, RestaurantID) VALUES (?, ?, ?)');
                    $stmt->bind_param('iii', $userId, $userId, $restaurantId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'agent') {
                    // Agent is a delivery agent
                    $stmt = $conn->prepare('INSERT INTO Customer (CustomerID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();

                    $stmt = $conn->prepare('INSERT INTO DeliveryAgent (AgentID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();
                } else {
                    // Default to customer
                    $stmt = $conn->prepare('INSERT INTO Customer (CustomerID, UserID) VALUES (?, ?)');
                    $stmt->bind_param('ii', $userId, $userId);
                    $stmt->execute();
                    $stmt->close();
                }

                $conn->commit();

                echo json_encode([
                    'success' => true,
                    'message' => 'Account created successfully',
                    'userId' => $userId
                ]);
            } catch (mysqli_sql_exception $e) {
                $conn->rollback();
                if ($e->getCode() === 1062) {
                    http_response_code(409);
                    echo json_encode(['error' => 'Email or phone number already exists']);
                } else {
                    throw $e;
                }
            }
            break;

        case 'check':
            if (!isset($_SESSION['user_id'])) {
                echo json_encode(['authenticated' => false]);
                exit;
            }

            $primaryRole = $_SESSION['primary_role'] ?? 'customer';
            $roleData = $_SESSION['role_data'] ?? null;

            echo json_encode([
                'authenticated' => true,
                'user' => [
                    'id' => 'u' . $_SESSION['user_id'],
                    'name' => $_SESSION['name'],
                    'email' => $_SESSION['email'],
                    'phone' => $_SESSION['phone'] ?? '',
                    'role' => $primaryRole,
                    'roleData' => $roleData
                ]
            ]);
            break;

        case 'logout':
            session_unset();
            session_destroy();
            echo json_encode(['success' => true]);
            break;

        case 'checkAdmin':
            $stmt = $conn->prepare('SELECT AdminID FROM Admin LIMIT 1');
            $stmt->execute();
            $result = $stmt->get_result();
            $adminExists = $result->num_rows > 0;
            $stmt->close();

            echo json_encode(['adminExists' => $adminExists]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
