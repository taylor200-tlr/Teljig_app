<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Kapcsolódási hiba"]);
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id > 0) {
    $sql = "DELETE FROM munkak WHERE id = $id";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Sor sikeresen törölve!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Hiba a törlés során: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Érvénytelen ID!"]);
}

$conn->close();
?>