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

            $stmt = $conn->prepare('SELECT a.AccountID, a.UserID, a.Password, u.Name, u.Email, u.PhoneNumber FROM Account a INNER JOIN User u ON u.UserID = a.UserID WHERE u.Email = ?');
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $account = $result->fetch_assoc();
            $stmt->close();

            if (!$account || !password_verify($password, $account['Password'])) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
                exit;
            }

            // Get user roles
            require 'session_helper.php';
            $roles = getUserRoles($conn, $account['UserID']);

            // Determine primary role (priority: admin > owner > agent > customer)
            $primaryRole = 'customer';
            $roleData = null;

            foreach ($roles as $role) {
                if ($role['type'] === 'admin') {
                    $primaryRole = 'admin';
                    $roleData = $role;
                    break;
                } elseif ($role['type'] === 'owner') {
                    $primaryRole = 'owner';
                    $roleData = $role;
                    break;
                } elseif ($role['type'] === 'agent') {
                    $primaryRole = 'agent';
                    $roleData = $role;
                } elseif ($role['type'] === 'customer' && !$roleData) {
                    $roleData = $role;
                }
            }

            // Set session
            $_SESSION['user_id'] = $account['UserID'];
            $_SESSION['account_id'] = $account['AccountID'];
            $_SESSION['name'] = $account['Name'];
            $_SESSION['email'] = $account['Email'];
            $_SESSION['phone'] = $account['PhoneNumber'];
            $_SESSION['primary_role'] = $primaryRole;

            // Temporarily add this before the final response:
            error_log("DEBUG - User roles: " . json_encode($roles));
            error_log("DEBUG - Primary role: " . $primaryRole);

            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => 'u' . $account['UserID'],
                    'name' => $account['Name'],
                    'email' => $account['Email'],
                    'phone' => $account['PhoneNumber'],
                    'role' => $primaryRole,
                    'roleData' => $roleData,
                    'allRoles' => $roles // TEMPORARY - for debugging
                ]
            ]);

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
            $confirm = $data['confirm'] ?? '';
            $role = $data['role'] ?? 'customer';
            $town = trim($data['town'] ?? '');

            // Validation
            if (empty($name) || empty($email) || empty($password) || empty($confirm)) {
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
                    http_response_code(400);
                    echo json_encode(['error' => 'Admin account already exists']);
                    exit;
                }
                $stmt->close();
            }

            $conn->begin_transaction();
            try {
                // Create user
                $stmt = $conn->prepare('INSERT INTO User (Name, PhoneNumber, Email) VALUES (?, ?, ?)');
                $stmt->bind_param('sss', $name, $phone, $email);
                $stmt->execute();
                $userId = $stmt->insert_id;
                $stmt->close();

                // Create account
                $hashed = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $conn->prepare('INSERT INTO Account (UserID, PhoneNumber, Password) VALUES (?, ?, ?)');
                $stmt->bind_param('iss', $userId, $phone, $hashed);
                $stmt->execute();
                $stmt->close();

                // Create role-specific records
                if ($role === 'customer') {
                    $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
                    $stmt->bind_param('i', $userId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'admin') {
                    $stmt = $conn->prepare('INSERT INTO Admin (UserID) VALUES (?)');
                    $stmt->bind_param('i', $userId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'owner') {
                    // Owner becomes a manager - create staff and manager records
                    $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
                    $stmt->bind_param('i', $userId);
                    $stmt->execute();
                    $stmt->close();

                    $staffRole = 'MANAGER';
                    $status = 'ACTIVE';
                    $stmt = $conn->prepare('INSERT INTO RestaurantStaff (UserID, RestaurantID, Role, DateHired, Status) VALUES (?, NULL, ?, CURDATE(), ?)');
                    $stmt->bind_param('iss', $userId, $staffRole, $status);
                    $stmt->execute();
                    $staffId = $stmt->insert_id;
                    $stmt->close();

                    $stmt = $conn->prepare('INSERT INTO RestaurantManager (StaffID) VALUES (?)');
                    $stmt->bind_param('i', $staffId);
                    $stmt->execute();
                    $stmt->close();
                } elseif ($role === 'agent') {
                    // Agent becomes a delivery agent - create staff and delivery agent records
                    $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
                    $stmt->bind_param('i', $userId);
                    $stmt->execute();
                    $stmt->close();

                    $staffRole = 'DELIVERY';
                    $status = 'ACTIVE';
                    $stmt = $conn->prepare('INSERT INTO RestaurantStaff (UserID, RestaurantID, Role, DateHired, Status) VALUES (?, NULL, ?, CURDATE(), ?)');
                    $stmt->bind_param('iss', $userId, $staffRole, $status);
                    $stmt->execute();
                    $staffId = $stmt->insert_id;
                    $stmt->close();

                    $stmt = $conn->prepare('INSERT INTO DeliveryAgent (StaffID) VALUES (?)');
                    $stmt->bind_param('i', $staffId);
                    $stmt->execute();
                    $stmt->close();
                } else {
                    // Default to customer if unknown role
                    $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
                    $stmt->bind_param('i', $userId);
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
                    echo json_encode(['error' => 'Email already exists']);
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

            require 'session_helper.php';
            $roles = getUserRoles($conn, $_SESSION['user_id']);
            
            $primaryRole = $_SESSION['primary_role'] ?? 'customer';
            $roleData = null;
            
            foreach ($roles as $role) {
                if ($role['type'] === $primaryRole) {
                    $roleData = $role;
                    break;
                }
            }

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