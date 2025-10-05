<?php
session_start();
require 'config.php';
require 'session_helper.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: auth.php');
    exit;
}

$userId = $_SESSION['user_id'];
$roles = getUserRoles($conn, $userId);

$primaryRole = 'customer';
$roleData = null;

foreach ($roles as $role) {
    if ($role['type'] === 'admin') {
        $primaryRole = 'admin';
        $roleData = $role;
        break;
    } elseif ($role['type'] === 'manager') {
        $primaryRole = 'manager';
        $roleData = $role;
        break;
    } elseif ($role['type'] === 'driver') {
        $primaryRole = 'driver';
        $roleData = $role;
    } elseif ($role['type'] === 'customer' && $primaryRole === 'customer') {
        $roleData = $role;
    }
}

$summary = [];

if ($primaryRole === 'customer' && $roleData) {
    $customerId = $roleData['id'];
    try {
        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM Reservation WHERE CustomerID = ?');
        $stmt->bind_param('i', $customerId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['reservations'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM CustomerOrder WHERE CustomerID = ?');
        $stmt->bind_param('i', $customerId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['orders'] = (int)($result['total'] ?? 0);
        $stmt->close();
    } catch (mysqli_sql_exception $e) {}
} elseif ($primaryRole === 'manager' && $roleData) {
    $restaurantId = $roleData['restaurantId'];
    try {
        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM CustomerOrder WHERE RestaurantID = ? AND OrderStatus = "RECEIVED"');
        $stmt->bind_param('i', $restaurantId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['pending_orders'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM RestaurantTable WHERE RestaurantID = ? AND Status = "SEATED"');
        $stmt->bind_param('i', $restaurantId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['active_tables'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->prepare('SELECT RestaurantName FROM Restaurant WHERE RestaurantID = ?');
        $stmt->bind_param('i', $restaurantId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['restaurant_name'] = $result['RestaurantName'] ?? 'Your Restaurant';
        $stmt->close();
    } catch (mysqli_sql_exception $e) {}
} elseif ($primaryRole === 'driver' && $roleData) {
    $driverId = $roleData['id'];
    try {
        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM Delivery WHERE DeliveryAgentID = ? AND Status IN ("ASSIGNED", "ACCEPTED")');
        $stmt->bind_param('i', $driverId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['active_deliveries'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->prepare('SELECT COUNT(*) AS total FROM Delivery WHERE DeliveryAgentID = ? AND Status = "DELIVERED"');
        $stmt->bind_param('i', $driverId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $summary['completed_deliveries'] = (int)($result['total'] ?? 0);
        $stmt->close();
    } catch (mysqli_sql_exception $e) {}
} elseif ($primaryRole === 'admin') {
    try {
        $stmt = $conn->query('SELECT COUNT(*) AS total FROM Restaurant');
        $result = $stmt->fetch_assoc();
        $summary['restaurants'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->query('SELECT COUNT(*) AS total FROM User');
        $result = $stmt->fetch_assoc();
        $summary['users'] = (int)($result['total'] ?? 0);
        $stmt->close();

        $stmt = $conn->query('SELECT COUNT(*) AS total FROM CustomerOrder WHERE DATE(OrderDate) = CURDATE()');
        $result = $stmt->fetch_assoc();
        $summary['today_orders'] = (int)($result['total'] ?? 0);
        $stmt->close();
    } catch (mysqli_sql_exception $e) {}
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Servesoft Dashboard</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <section class="auth-shell">
    <article class="card">
      <header>
        <h1>Hi <?= htmlspecialchars($_SESSION['name'] ?? 'Servesoft User') ?>!</h1>
        <p>Your role: <strong><?= strtoupper($primaryRole) ?></strong></p>
      </header>

      <?php if ($primaryRole === 'customer'): ?>
        <section class="summary">
          <h2>Customer Dashboard</h2>
          <div class="grid-two">
            <div class="card">
              <h3>Reservations</h3>
              <p class="tag success"><?= $summary['reservations'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Orders</h3>
              <p class="tag info"><?= $summary['orders'] ?? 0 ?></p>
            </div>
          </div>
          <div class="callout">
            API endpoints are ready. Use api_customer.php?action=get_menu, add_to_cart, place_order, get_orders, create_reservation
          </div>
        </section>

      <?php elseif ($primaryRole === 'manager'): ?>
        <section class="summary">
          <h2>Manager Dashboard - <?= htmlspecialchars($summary['restaurant_name'] ?? 'Restaurant') ?></h2>
          <div class="grid-three">
            <div class="card">
              <h3>Pending Orders</h3>
              <p class="tag warning"><?= $summary['pending_orders'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Active Tables</h3>
              <p class="tag success"><?= $summary['active_tables'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Restaurant</h3>
              <p class="tag"><?= htmlspecialchars($summary['restaurant_name'] ?? 'N/A') ?></p>
            </div>
          </div>
          <div class="callout">
            API endpoints are ready. Use api_manager.php?action=get_orders, update_order_status, get_tables, update_table_status, get_menu, add_menu_item, get_reservations, get_staff, assign_delivery
          </div>
        </section>

      <?php elseif ($primaryRole === 'driver'): ?>
        <section class="summary">
          <h2>Driver Dashboard</h2>
          <div class="grid-two">
            <div class="card">
              <h3>Active Deliveries</h3>
              <p class="tag warning"><?= $summary['active_deliveries'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Completed Today</h3>
              <p class="tag success"><?= $summary['completed_deliveries'] ?? 0 ?></p>
            </div>
          </div>
          <div class="callout">
            API endpoints are ready. Use api_driver.php?action=get_deliveries, accept_delivery, decline_delivery, update_delivery_milestone
          </div>
        </section>

      <?php elseif ($primaryRole === 'admin'): ?>
        <section class="summary">
          <h2>Admin Dashboard</h2>
          <div class="grid-three">
            <div class="card">
              <h3>Restaurants</h3>
              <p class="tag"><?= $summary['restaurants'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Total Users</h3>
              <p class="tag info"><?= $summary['users'] ?? 0 ?></p>
            </div>
            <div class="card">
              <h3>Today's Orders</h3>
              <p class="tag success"><?= $summary['today_orders'] ?? 0 ?></p>
            </div>
          </div>
          <div class="callout">
            API endpoints are ready. Use api_admin.php?action=get_restaurants, create_restaurant, get_users, assign_customer_role, assign_admin_role, assign_staff_role, assign_manager_role, assign_driver_role, get_all_orders
          </div>
        </section>
      <?php endif; ?>

      <section class="summary">
        <h2>Your Profile</h2>
        <p><strong>Email:</strong> <?= htmlspecialchars($_SESSION['email'] ?? '') ?></p>
        <p><strong>Phone:</strong> <?= htmlspecialchars($_SESSION['phone'] ?? 'Not provided') ?></p>
      </section>

      <div class="actions">
        <a href="views.php"><button class="link">View Database</button></a>
        <form action="logout.php" method="post" style="display: inline;">
          <button class="ghost" type="submit" name="logout" value="1">Logout</button>
        </form>
      </div>
    </article>
  </section>
</body>
</html>
