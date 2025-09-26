<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'tsvrot2025-server.mysql.database.azure.com';
$db = 'tsvrot2025-database';
$user = 'flfhdqzgsh';
$pass = 'HalloTSVRot2025';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $action = $_GET['action'] ?? 'test';
    
    switch($action) {
        case 'trainers':
            $stmt = $pdo->query("SELECT * FROM trainers WHERE active = 1 ORDER BY name");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'courses':
            $stmt = $pdo->query("SELECT * FROM courses WHERE active = 1 ORDER BY weekday, time");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'week':
            $stmt = $pdo->query("
                SELECT c.*, GROUP_CONCAT(t.name) as trainers 
                FROM courses c 
                LEFT JOIN course_trainer_defaults ctd ON c.id = ctd.course_id
                LEFT JOIN trainers t ON ctd.trainer_id = t.id
                WHERE c.active = 1
                GROUP BY c.id
                ORDER BY FIELD(c.weekday,'Montag','Dienstag','Mittwoch','Donnerstag','Freitag'), c.time
            ");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        default:
            echo json_encode(['status' => 'ok', 'database' => 'connected']);
    }
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
