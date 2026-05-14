<?php
// Hibajelentés bekapcsolása (csak tesztelés idejére, hogy lássuk ha baj van)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json'); // Megmondjuk a böngészőnek, hogy ez JSON

$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Kapcsolódási hiba"]);
    exit;
}

// Próbáljuk meg a CURDATE() helyett a pontos dátumot manuálisan, 
// hátha a szerver órája mást mutat
$maiDatum = date('Y-m-d');

$sql = "SELECT id, DATE_FORMAT(datum, '%H:%i') as ido, osszesen 
        FROM munkak 
        WHERE DATE(datum) = '$maiDatum' 
        ORDER BY datum DESC";

$result = $conn->query($sql);
$lista = [];

if ($result) {
    while($row = $result->fetch_assoc()) {
        $lista[] = $row;
    }
}

echo json_encode($lista);
$conn->close();
?>