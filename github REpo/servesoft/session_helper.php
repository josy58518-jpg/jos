<?php
function getUserRoles($conn, $userId) {
    $roles = [];

    $stmt = $conn->prepare('SELECT CustomerID FROM Customer WHERE UserID = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $roles[] = ['type' => 'customer', 'id' => $row['CustomerID']];
    }
    $stmt->close();

    $stmt = $conn->prepare('SELECT AdminID FROM Admin WHERE UserID = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $roles[] = ['type' => 'admin', 'id' => $row['AdminID']];
    }
    $stmt->close();

    $stmt = $conn->prepare('SELECT StaffID, RestaurantID, Role, Status FROM RestaurantStaff WHERE UserID = ? AND Status = "ACTIVE"');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $staff = $result->fetch_assoc();
        $staffId = $staff['StaffID'];
        $restaurantId = $staff['RestaurantID'];

        $stmt2 = $conn->prepare('SELECT ManagerID FROM RestaurantManager WHERE StaffID = ?');
        $stmt2->bind_param('i', $staffId);
        $stmt2->execute();
        $managerResult = $stmt2->get_result();
        if ($managerResult->num_rows > 0) {
            $manager = $managerResult->fetch_assoc();
            $roles[] = ['type' => 'owner', 'id' => $manager['ManagerID'], 'staffId' => $staffId, 'restaurantId' => $restaurantId];
        }
        $stmt2->close();

        $stmt3 = $conn->prepare('SELECT DeliveryAgentID FROM DeliveryAgent WHERE StaffID = ?');
        $stmt3->bind_param('i', $staffId);
        $stmt3->execute();
        $driverResult = $stmt3->get_result();
        if ($driverResult->num_rows > 0) {
            $driver = $driverResult->fetch_assoc();
            $roles[] = ['type' => 'agent', 'id' => $driver['DeliveryAgentID'], 'staffId' => $staffId, 'restaurantId' => $restaurantId];
        }
        $stmt3->close();

        if (count($roles) === 0 || $roles[count($roles) - 1]['type'] === 'customer' || $roles[count($roles) - 1]['type'] === 'admin') {
            $roles[] = ['type' => 'staff', 'id' => $staffId, 'restaurantId' => $restaurantId, 'role' => $staff['Role']];
        }
    }
    $stmt->close();

    return $roles;
}

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }
}

function requireRole($conn, $userId, $requiredRole) {
    $roles = getUserRoles($conn, $userId);
    $hasRole = false;
    foreach ($roles as $role) {
        if ($role['type'] === $requiredRole) {
            $hasRole = true;
            break;
        }
    }
    if (!$hasRole) {
        http_response_code(403);
        echo json_encode(['error' => 'Insufficient permissions']);
        exit;
    }
    return $roles;
}
?>
