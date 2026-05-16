<?php
// Hibajelentés kényszerítése, hogy ha mégis baj van, ne 500-as hibát adjon, hanem kiírja a pontos okot
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Kapcsolódási hiba: " . $conn->connect_error]);
    exit;
}

// A legbiztosabb MySQL dátumkezelés: a CURDATE() függvénnyel nézzük meg a mai napot,
// és a korábban javított 'datum' oszlopnevet használjuk!
$sql = "SELECT id, DATE_FORMAT(datum, '%H:%i') as ido, adatok_json, osszesen 
        FROM munkak 
        WHERE DATE(datum) = CURDATE() 
        ORDER BY datum DESC";

$result = $conn->query($sql);
$lista = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $lista[] = $row;
    }
} else {
    echo json_encode(["error" => "SQL hiba: " . $conn->error]);
    $conn->close();
    exit;
}

echo json_encode($lista, JSON_UNESCAPED_UNICODE);
$conn->close();
?>