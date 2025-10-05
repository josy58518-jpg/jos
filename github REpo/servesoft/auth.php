<?php
session_start();
require 'config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email === '' || $password === '') {
        $error = 'Please provide both email and password.';
    } else {
        $sql = "SELECT a.AccountID, a.UserID, a.Password, u.Name, u.Email, u.PhoneNumber
                FROM Account a
                INNER JOIN User u ON u.UserID = a.UserID
                WHERE u.Email = ?";
        $stmt = $conn->prepare($sql);

        if ($stmt) {
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $account = $result->fetch_assoc();
            $stmt->close();

            if ($account && password_verify($password, $account['Password'])) {
                $_SESSION['user_id'] = $account['UserID'];
                $_SESSION['account_id'] = $account['AccountID'];
                $_SESSION['name'] = $account['Name'];
                $_SESSION['email'] = $account['Email'];
                $_SESSION['phone'] = $account['PhoneNumber'];

                header('Location: hello.php');
                exit;
            }
        }

        if ($error === '') {
            $error = 'Invalid login credentials. Please try again.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Servesoft Login</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <section class="auth-shell">
    <article class="card">
      <header>
        <h1>Welcome Back</h1>
        <p>Sign in with your Servesoft email to continue.</p>
      </header>
      <?php if ($error): ?>
        <div class="alert error"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>
      <form method="post" novalidate>
        <label for="email">
          Email
          <input type="email" id="email" name="email" placeholder="you@example.com" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required>
        </label>
        <label for="password">
          Password
          <input type="password" id="password" name="password" placeholder="••••••••" required>
        </label>
        <div class="actions">
          <button class="primary" type="submit">Login</button>
          <a href="register.php"><button class="secondary" type="button">Need an account?</button></a>
        </div>
      </form>
      <p class="helper-text">
        Having trouble? Contact your Servesoft administrator for assistance.
      </p>
    </article>
  </section>
</body>
</html>