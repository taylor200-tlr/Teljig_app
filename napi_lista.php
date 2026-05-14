<?php
$servername = "localhost";
$username = "rh68979_taylor200"; 
$password = "..dx9LWmYtIO";
$dbname = "rh68979_munkak";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) die(json_encode([]));

// Csak a mai mentések lekérése
$sql = "SELECT id, DATE_FORMAT(idopont, '%H:%i') as ido, osszesen 
        FROM munkak 
        WHERE DATE(idopont) = CURDATE() 
        ORDER BY idopont DESC";

$result = $conn->query($sql);
$lista = [];

while($row = $result->fetch_assoc()) {
    $lista[] = $row;
}

echo json_encode($lista);
$conn->close();
?>