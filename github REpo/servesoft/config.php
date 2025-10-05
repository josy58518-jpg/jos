<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$servername = "localhost";
$username = "root";
$password = "";
$database = "SERVESOFT";

$conn = new mysqli($servername, $username, $password, $database);
$conn->set_charset('utf8mb4');
?>