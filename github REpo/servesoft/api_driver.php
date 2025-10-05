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
$roles = requireRole($conn, $userId, 'driver');

$driverId = null;
foreach ($roles as $role) {
    if ($role['type'] === 'driver') {
        $driverId = $role['id'];
        break;
    }
}

if (!$driverId) {
    http_response_code(403);
    echo json_encode(['error' => 'Driver role not found']);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'get_deliveries':
            $status = $_GET['status'] ?? 'ALL';

            $sql = 'SELECT d.DeliveryID, d.OrderID, d.PickupLocation, d.Status, d.EstimatedTime, d.DeliveredTime, o.DeliveryAddress, o.OrderDate FROM Delivery d INNER JOIN CustomerOrder o ON d.OrderID = o.OrderID WHERE d.DeliveryAgentID = ?';
            $params = [$driverId];
            $types = 'i';

            if ($status !== 'ALL') {
                $sql .= ' AND d.Status = ?';
                $params[] = $status;
                $types .= 's';
            }
            $sql .= ' ORDER BY o.OrderDate DESC';

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            $deliveries = [];
            while ($row = $result->fetch_assoc()) {
                $deliveries[] = [
                    'id' => $row['DeliveryID'],
                    'orderId' => $row['OrderID'],
                    'pickupLocation' => $row['PickupLocation'],
                    'deliveryAddress' => $row['DeliveryAddress'],
                    'status' => $row['Status'],
                    'estimatedTime' => $row['EstimatedTime'],
                    'deliveredTime' => $row['DeliveredTime'],
                    'orderDate' => $row['OrderDate']
                ];
            }
            $stmt->close();
            echo json_encode(['success' => true, 'deliveries' => $deliveries]);
            break;

        case 'accept_delivery':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $deliveryId = intval($data['delivery_id'] ?? 0);

            $stmt = $conn->prepare('UPDATE Delivery SET Status = ? WHERE DeliveryID = ? AND DeliveryAgentID = ?');
            $status = 'ACCEPTED';
            $stmt->bind_param('sii', $status, $deliveryId, $driverId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Delivery accepted']);
            break;

        case 'decline_delivery':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $deliveryId = intval($data['delivery_id'] ?? 0);

            $stmt = $conn->prepare('UPDATE Delivery SET Status = ?, DeliveryAgentID = NULL WHERE DeliveryID = ? AND DeliveryAgentID = ?');
            $status = 'UNASSIGNED';
            $stmt->bind_param('sii', $status, $deliveryId, $driverId);
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Delivery declined']);
            break;

        case 'update_delivery_milestone':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
                break;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $deliveryId = intval($data['delivery_id'] ?? 0);
            $milestone = $data['milestone'] ?? '';

            $validMilestones = ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
            if (!in_array($milestone, $validMilestones)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid milestone']);
                break;
            }

            $updateData = ['Status' => $milestone];
            if ($milestone === 'DELIVERED' || $milestone === 'FAILED') {
                $updateData['DeliveredTime'] = date('Y-m-d H:i:s');
            }

            if (isset($updateData['DeliveredTime'])) {
                $stmt = $conn->prepare('UPDATE Delivery SET Status = ?, DeliveredTime = ? WHERE DeliveryID = ? AND DeliveryAgentID = ?');
                $stmt->bind_param('ssii', $milestone, $updateData['DeliveredTime'], $deliveryId, $driverId);
            } else {
                $stmt = $conn->prepare('UPDATE Delivery SET Status = ? WHERE DeliveryID = ? AND DeliveryAgentID = ?');
                $stmt->bind_param('sii', $milestone, $deliveryId, $driverId);
            }
            $stmt->execute();
            $stmt->close();

            echo json_encode(['success' => true, 'message' => 'Delivery milestone updated']);
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
