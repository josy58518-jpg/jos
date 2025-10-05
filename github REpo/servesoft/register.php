<?php
session_start();
require 'config.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    if ($name === '' || $email === '' || $password === '' || $confirm === '') {
        $error = 'All required fields must be completed.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please provide a valid email address.';
    } elseif ($password !== $confirm) {
        $error = 'Passwords do not match.';
    } elseif (strlen($password) < 8 ||
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/\d/', $password) ||
        !preg_match('/[^A-Za-z0-9]/', $password)) {
        $error = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
    } else {
        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare('INSERT INTO User (Name, PhoneNumber, Email) VALUES (?, ?, ?)');
            $stmt->bind_param('sss', $name, $phone, $email);
            $stmt->execute();
            $userId = $stmt->insert_id;
            $stmt->close();

            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare('INSERT INTO Account (UserID, PhoneNumber, Password) VALUES (?, ?, ?)');
            $stmt->bind_param('iss', $userId, $phone, $hashed);
            $stmt->execute();
            $stmt->close();

            $stmt = $conn->prepare('INSERT INTO Customer (UserID) VALUES (?)');
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            $success = 'Account created! You can now sign in.';
        } catch (mysqli_sql_exception $e) {
            $conn->rollback();
            if ($e->getCode() === 1062) {
                $error = 'An account with that email already exists.';
            } else {
                $error = 'Registration failed. Please try again.';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Servesoft Account</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <section class="auth-shell">
    <article class="card">
      <header>
        <h1>Create Your Account</h1>
        <p>Join Servesoft to manage your reservations and orders.</p>
      </header>
      <?php if ($error): ?>
        <div class="alert error"><?= htmlspecialchars($error) ?></div>
      <?php elseif ($success): ?>
        <div class="alert success"><?= htmlspecialchars($success) ?></div>
      <?php endif; ?>
      <form method="post" novalidate>
        <label for="name">
          Full Name
          <input type="text" id="name" name="name" placeholder="Jane Doe" value="<?= htmlspecialchars($_POST['name'] ?? '') ?>" required>
        </label>
        <label for="phone">
          Phone Number
          <input type="tel" id="phone" name="phone" placeholder="Optional" value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
        </label>
        <label for="email">
          Email
          <input type="email" id="email" name="email" placeholder="you@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
        </label>
        <label for="password">
          Password
          <input type="password" id="password" name="password" placeholder="Create a strong password" required>
        </label>
        <label for="confirm_password">
          Confirm Password
          <input type="password" id="confirm_password" name="confirm_password" placeholder="Repeat your password" required>
        </label>
        <div class="actions">
          <button class="secondary" type="submit">Register</button>
          <a href="auth.php"><button class="primary" type="button">Back to login</button></a>
        </div>
      </form>
      <p class="helper-text">Passwords require 8+ characters with uppercase, lowercase, number, and symbol.</p>
    </article>
  </section>
</body>
</html>