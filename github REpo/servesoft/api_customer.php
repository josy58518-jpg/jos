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
$roles = requireRole($conn, $userId, 'customer');

$customerId = null;
foreach ($roles as $role) {
    if ($role['type'] === 'customer') {
        $customerId = $role['id'];
        break;
    }
}

if (!$customerId) {
    http_response_code(403);
    echo json_encode(['error' => 'Customer role not found']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'get_menu':
            $restaurantId = intval($_GET['restaurant_id'] ?? 1);
            $stmt = $conn->prepare('SELECT MenuID, ItemName, ItemDescription, Category, Price, Availability FROM MenuItem WHERE RestaurantID = ? AND Availability = 1');
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

        case 'get_cart':
            $stmt = $conn->prepare('SELECT c.CartID, c.TotalAmount FROM Cart c WHERE c.CustomerID = ?');
            $stmt->bind_param('i', $customerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $cart = $result->fetch_assoc();
            $stmt->close();

            if (!$cart) {
                echo json_encode(['success' => true, 'cart' => null, 'items' => []]);
                break;
            }

            $cartId = $cart['CartID'];
            $stmt = $conn->prepare('SELECT ci.CartItemID, ci.MenuID, ci.Quantity, m.ItemName, m.Price FROM CartItem ci INNER JOIN MenuItem m ON ci.MenuID = m.MenuID WHERE ci.CartID = ?');
            $stmt->bind_param('i', $cartId);
            $stmt->execute();
            $result = $stmt->get_result();
            $items = [];
            while ($row = $result->fetch_assoc()) {
                $items[] = [
                    'cartItemId' => $row['CartItemID'],
                    'menuId' => $row['MenuID'],
                    'name' => $row['ItemName'],
                    'price' => floatval($row['Price']),
                    'quantity' => intval($row['Quantity'])
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'cart' => $cart, 'items' => $items]);
            break;

        case 'add_to_cart':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $menuId = intval($data['menu_id'] ?? 0);
            $quantity = intval($data['quantity'] ?? 1);

            if (!$menuId || $quantity < 1) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input']);
                break;
            }

            $stmt = $conn->prepare('SELECT CartID FROM Cart WHERE CustomerID = ?');
            $stmt->bind_param('i', $customerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $cart = $result->fetch_assoc();
            $stmt->close();

            if (!$cart) {
                $stmt = $conn->prepare('INSERT INTO Cart (CustomerID, TotalAmount) VALUES (?, 0)');
                $stmt->bind_param('i', $customerId);
                $stmt->execute();
                $cartId = $stmt->insert_id;
                $stmt->close();
            } else {
                $cartId = $cart['CartID'];
            }

            $stmt = $conn->prepare('SELECT CartItemID, Quantity FROM CartItem WHERE CartID = ? AND MenuID = ?');
            $stmt->bind_param('ii', $cartId, $menuId);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                $newQty = $existing['Quantity'] + $quantity;
                $stmt = $conn->prepare('UPDATE CartItem SET Quantity = ? WHERE CartItemID = ?');
                $stmt->bind_param('ii', $newQty, $existing['CartItemID']);
                $stmt->execute();
                $stmt->close();
            } else {
                $stmt = $conn->prepare('INSERT INTO CartItem (CartID, MenuID, Quantity) VALUES (?, ?, ?)');
                $stmt->bind_param('iii', $cartId, $menuId, $quantity);
                $stmt->execute();
                $stmt->close();
            }

            $stmt = $conn->prepare('SELECT COALESCE(SUM(ci.Quantity * m.Price), 0) AS total FROM CartItem ci INNER JOIN MenuItem m ON ci.MenuID = m.MenuID WHERE ci.CartID = ?');
            $stmt->bind_param('i', $cartId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $total = $row['total'];
            $stmt->close();

            $stmt = $conn->prepare('UPDATE Cart SET TotalAmount = ? WHERE CartID = ?');
            $stmt->bind_param('di', $total, $cartId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Item added to cart']);
            break;

        case 'remove_from_cart':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $cartItemId = intval($data['cart_item_id'] ?? 0);

            $stmt = $conn->prepare('DELETE FROM CartItem WHERE CartItemID = ?');
            $stmt->bind_param('i', $cartItemId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Item removed']);
            break;

        case 'place_order':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $restaurantId = intval($data['restaurant_id'] ?? 1);
            $orderType = $data['order_type'] ?? 'DINE_IN';
            $deliveryAddress = $data['delivery_address'] ?? null;

            $stmt = $conn->prepare('SELECT CartID FROM Cart WHERE CustomerID = ?');
            $stmt->bind_param('i', $customerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $cart = $result->fetch_assoc();
            $stmt->close();

            if (!$cart) {
                http_response_code(400);
                echo json_encode(['error' => 'Cart is empty']);
                break;
            }

            $cartId = $cart['CartID'];

            $stmt = $conn->prepare('SELECT COUNT(*) AS cnt FROM CartItem WHERE CartID = ?');
            $stmt->bind_param('i', $cartId);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $stmt->close();

            if ($row['cnt'] == 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Cart is empty']);
                break;
            }

            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare('INSERT INTO CustomerOrder (CustomerID, RestaurantID, CartID, OrderType, OrderStatus, DeliveryAddress) VALUES (?, ?, ?, ?, ?, ?)');
                $status = 'RECEIVED';
                $stmt->bind_param('iiisss', $customerId, $restaurantId, $cartId, $orderType, $status, $deliveryAddress);
                $stmt->execute();
                $orderId = $stmt->insert_id;
                $stmt->close();

                $stmt = $conn->prepare('SELECT ci.MenuID, ci.Quantity, m.Price FROM CartItem ci INNER JOIN MenuItem m ON ci.MenuID = m.MenuID WHERE ci.CartID = ?');
                $stmt->bind_param('i', $cartId);
                $stmt->execute();
                $result = $stmt->get_result();
                $stmt->close();

                $insertStmt = $conn->prepare('INSERT INTO OrderItem (OrderID, MenuID, ItemQuantity, ItemPrice) VALUES (?, ?, ?, ?)');
                while ($row = $result->fetch_assoc()) {
                    $menuId = $row['MenuID'];
                    $quantity = $row['Quantity'];
                    $price = $row['Price'];
                    $insertStmt->bind_param('iiid', $orderId, $menuId, $quantity, $price);
                    $insertStmt->execute();
                }
                $insertStmt->close();

                $stmt = $conn->prepare('DELETE FROM CartItem WHERE CartID = ?');
                $stmt->bind_param('i', $cartId);
                $stmt->execute();
                $stmt->close();

                $stmt = $conn->prepare('UPDATE Cart SET TotalAmount = 0 WHERE CartID = ?');
                $stmt->bind_param('i', $cartId);
                $stmt->execute();
                $stmt->close();

                $conn->commit();
                echo json_encode(['success' => true, 'order_id' => $orderId, 'message' => 'Order placed successfully']);
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
            break;

        case 'get_orders':
            $stmt = $conn->prepare('SELECT OrderID, RestaurantID, OrderDate, OrderType, OrderStatus, DeliveryAddress FROM CustomerOrder WHERE CustomerID = ? ORDER BY OrderDate DESC');
            $stmt->bind_param('i', $customerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = [];
            while ($row = $result->fetch_assoc()) {
                $orders[] = [
                    'id' => $row['OrderID'],
                    'restaurantId' => $row['RestaurantID'],
                    'date' => $row['OrderDate'],
                    'type' => $row['OrderType'],
                    'status' => $row['OrderStatus'],
                    'deliveryAddress' => $row['DeliveryAddress']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'orders' => $orders]);
            break;

        case 'get_reservations':
            $stmt = $conn->prepare('SELECT r.ReservationID, r.TableID, r.ReservationDate, r.NumberOfGuests, r.Status, t.TableNumber FROM Reservation r INNER JOIN RestaurantTable t ON r.TableID = t.TableID WHERE r.CustomerID = ? ORDER BY r.ReservationDate DESC');
            $stmt->bind_param('i', $customerId);
            $stmt->execute();
            $result = $stmt->get_result();
            $reservations = [];
            while ($row = $result->fetch_assoc()) {
                $reservations[] = [
                    'id' => $row['ReservationID'],
                    'tableId' => $row['TableID'],
                    'tableNumber' => $row['TableNumber'],
                    'date' => $row['ReservationDate'],
                    'guests' => intval($row['NumberOfGuests']),
                    'status' => $row['Status']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'reservations' => $reservations]);
            break;

        case 'create_reservation':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $tableId = intval($data['table_id'] ?? 0);
            $reservationDate = $data['reservation_date'] ?? '';
            $numberOfGuests = intval($data['number_of_guests'] ?? 1);

            $stmt = $conn->prepare('INSERT INTO Reservation (CustomerID, TableID, ReservationDate, NumberOfGuests, Status) VALUES (?, ?, ?, ?, ?)');
            $status = 'PENDING';
            $stmt->bind_param('iisis', $customerId, $tableId, $reservationDate, $numberOfGuests, $status);
            $stmt->execute();
            $reservationId = $stmt->insert_id;
            $stmt->close();

            echo json_encode(['success' => true, 'reservation_id' => $reservationId, 'message' => 'Reservation created']);
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
