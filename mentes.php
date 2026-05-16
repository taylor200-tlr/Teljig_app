<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// Hibakeresés bekapcsolása (ha valami nem menne, látni fogjuk)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// --- RACKHOST ADATOK ---
$servername = "localhost";
$username = "rh68979_taylor200";
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

// Kapcsolódás
$conn = new mysqli($servername, $username, $password, $dbname);
$conn->set_charset("utf8mb4");

// Kapcsolat ellenőrzése
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Kapcsolódási hiba: " . $conn->connect_error]));
}

// A JavaScripttől érkező adatok beolvasása
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    // Adatok előkészítése a mentésre
    $adatok_json = $conn->real_escape_string(json_encode($data['tetelek'], JSON_UNESCAPED_UNICODE));
    $osszesen = intval($data['osszesen']);

    // SQL parancs a mentéshez
    $sql = "INSERT INTO munkak (adatok_json, osszesen) VALUES ('$adatok_json', $osszesen)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Sikeres mentés!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Hiba a mentésnél: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Nincs kapott adat"]);
}

$conn->close();
?>