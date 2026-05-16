<?php
header('Content-Type: application/json; charset=utf-8');
$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Kapcsolódási hiba"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// JAVÍTÁS: Csak azt ellenőrizzük, hogy az 'id' megérkezett-e, a többit pedig biztonságosan kinyerjük
if (isset($data['id'])) {
    $id = intval($data['id']);
    
    // Ha a tetelek nincs átadva vagy üres, akkor egy üres tömböt mentünk el [] formában
    $tetelek_tomb = isset($data['tetelek']) ? $data['tetelek'] : [];
    $adatok_json = $conn->real_escape_string(json_encode($tetelek_tomb, JSON_UNESCAPED_UNICODE));
    
    // Ha az összeg hiányozna, akkor 0 lesz
    $osszesen = isset($data['osszesen']) ? intval($data['osszesen']) : 0;

    $sql = "UPDATE munkak SET adatok_json = '$adatok_json', osszesen = $osszesen WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    // Ha ezt látod, akkor a JavaScript nem küldte el a 'currentSelectedId' értékét a PHP-nak!
    echo json_encode(["status" => "error", "message" => "Hiányzó vagy érvénytelen azonosító (ID) a módosításhoz!"]);
}

$conn->close();
?>