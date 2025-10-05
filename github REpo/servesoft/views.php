<?php
require 'config.php';

$tables = [];
$result = $conn->query('SHOW TABLES');
while ($row = $result->fetch_array(MYSQLI_NUM)) {
    $tables[] = $row[0];
}
$result->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SERVESOFT Schema Overview</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <section class="auth-shell">
    <article class="card">
      <header>
        <h1>SERVESOFT Database</h1>
        <p>Schema and snapshot of stored data.</p>
      </header>
      <?php foreach ($tables as $table): ?>
        <section class="summary">
          <h2><?= htmlspecialchars($table) ?></h2>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <?php
                  $describe = $conn->query("DESCRIBE `$table`");
                  while ($column = $describe->fetch_assoc()):
                ?>
                  <tr>
                    <td><?= htmlspecialchars($column['Field']) ?></td>
                    <td><?= htmlspecialchars($column['Type']) ?></td>
                  </tr>
                <?php endwhile; ?>
              </tbody>
            </table>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <?php
                    $columns = [];
                    $fields = $conn->query("SHOW COLUMNS FROM `$table`");
                    while ($field = $fields->fetch_assoc()) {
                        $columns[] = $field['Field'];
                        echo '<th>' . htmlspecialchars($field['Field']) . '</th>';
                    }
                  ?>
                </tr>
              </thead>
              <tbody>
                <?php
                  $rows = $conn->query("SELECT * FROM `$table`");
                  if ($rows->num_rows === 0):
                ?>
                  <tr>
                    <td colspan="<?= count($columns) ?>">No data recorded yet.</td>
                  </tr>
                <?php else:
                    while ($data = $rows->fetch_assoc()): ?>
                  <tr>
                    <?php foreach ($columns as $columnName): ?>
                      <td><?= htmlspecialchars((string)($data[$columnName] ?? '')) ?></td>
                    <?php endforeach; ?>
                  </tr>
                <?php endwhile;
                  endif; ?>
              </tbody>
            </table>
          </div>
        </section>
      <?php endforeach; ?>
      <footer>
        Connected to SERVESOFT database using mysqli.
      </footer>
    </article>
  </section>
</body>
</html>