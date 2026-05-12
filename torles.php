<?php
$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Szerver hiba"]));
}

// Megkeressük a legutolsó ID-t és töröljük
$sql = "DELETE FROM munkak ORDER BY id DESC LIMIT 1";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Utolsó mentés törölve!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Hiba a törlésnél: " . $conn->error]);
}

$conn->close();
?>