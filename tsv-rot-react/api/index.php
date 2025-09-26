<?php
/**
 * TSV Rot Trainer API - React Version
 * Arbeitet mit bestehender Azure MySQL-Datenbank
 * Copyright (c) 2025 Sissy Hägele
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Bestehende Azure-Datenbank Konfiguration
$config = [
    'host' => 'tsvrot2025-server.mysql.database.azure.com',
    'username' => 'flfhdqzgsh',
    'password' => 'HalloTSVRot2025',
    'database' => 'tsvrot2025-database',
    'charset' => 'utf8mb4'
];

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_SSL_CA => true,
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit();
}

// Router
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$segments = explode('/', trim($path, '/'));

// Authentication
function authenticate() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    
    // Simple token validation - in production use JWT
    $validTokens = [
        'admin' => ['token' => 'TSVAdmin2024', 'isAdmin' => true],
        'trainer' => ['token' => 'TSVRot2024', 'isAdmin' => false]
    ];
    
    foreach ($validTokens as $user) {
        if ($user['token'] === $token) {
            return $user;
        }
    }
    
    return null;
}

// Response helper
function jsonResponse($success, $data = null, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode(array_filter([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ]));
    exit();
}

// Routes
switch ($segments[0]) {
    case 'auth':
        handleAuth($method, $segments);
        break;
    case 'trainers':
        handleTrainers($method, $segments, $pdo);
        break;
    case 'courses':
        handleCourses($method, $segments, $pdo);
        break;
    case 'assignments':
        handleAssignments($method, $segments, $pdo);
        break;
    case 'absences':
        handleAbsences($method, $segments, $pdo);
        break;
    case 'stats':
        handleStats($method, $segments, $pdo);
        break;
    default:
        jsonResponse(false, null, 'Endpoint not found', 404);
}

// Auth handlers
function handleAuth($method, $segments) {
    if ($method === 'POST' && $segments[1] === 'login') {
        $input = json_decode(file_get_contents('php://input'), true);
        $password = $input['password'] ?? '';
        
        if ($password === 'TSVAdmin2024') {
            jsonResponse(true, ['token' => 'TSVAdmin2024', 'isAdmin' => true]);
        } elseif ($password === 'TSVRot2024') {
            jsonResponse(true, ['token' => 'TSVRot2024', 'isAdmin' => false]);
        } else {
            jsonResponse(false, null, 'Invalid password', 401);
        }
    } elseif ($method === 'GET' && $segments[1] === 'verify') {
        $user = authenticate();
        if ($user) {
            jsonResponse(true, ['isAdmin' => $user['isAdmin']]);
        } else {
            jsonResponse(false, null, 'Invalid token', 401);
        }
    } else {
        jsonResponse(false, null, 'Invalid auth endpoint', 404);
    }
}

// Trainers handlers
function handleTrainers($method, $segments, $pdo) {
    $user = authenticate();
    if (!$user) {
        jsonResponse(false, null, 'Authentication required', 401);
    }

    switch ($method) {
        case 'GET':
            if (isset($segments[1]) && is_numeric($segments[1])) {
                // Get single trainer
                $stmt = $pdo->prepare('SELECT * FROM trainers WHERE id = ?');
                $stmt->execute([$segments[1]]);
                $trainer = $stmt->fetch();
                
                if ($trainer) {
                    $trainer['qualifications'] = json_decode($trainer['qualifications'] ?? '[]', true);
                    $trainer['available_days'] = json_decode($trainer['available_days'] ?? '[]', true);
                    jsonResponse(true, $trainer);
                } else {
                    jsonResponse(false, null, 'Trainer not found', 404);
                }
            } else {
                // Get all trainers
                $stmt = $pdo->query('SELECT * FROM trainers ORDER BY name');
                $trainers = $stmt->fetchAll();
                
                foreach ($trainers as &$trainer) {
                    $trainer['qualifications'] = json_decode($trainer['qualifications'] ?? '[]', true);
                    $trainer['available_days'] = json_decode($trainer['available_days'] ?? '[]', true);
                }
                
                jsonResponse(true, $trainers);
            }
            break;

        case 'POST':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                INSERT INTO trainers (name, email, phone, qualifications, is_active, available_days, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            
            $result = $stmt->execute([
                $input['name'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                json_encode($input['qualifications'] ?? []),
                $input['isActive'] ? 1 : 0,
                json_encode($input['availableDays'] ?? []),
                $input['notes'] ?? null
            ]);
            
            if ($result) {
                $id = $pdo->lastInsertId();
                jsonResponse(true, ['id' => $id, 'message' => 'Trainer created']);
            } else {
                jsonResponse(false, null, 'Failed to create trainer', 500);
            }
            break;

        case 'PUT':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Trainer ID required', 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                UPDATE trainers 
                SET name = ?, email = ?, phone = ?, qualifications = ?, is_active = ?, available_days = ?, notes = ?, updated_at = NOW()
                WHERE id = ?
            ');
            
            $result = $stmt->execute([
                $input['name'],
                $input['email'] ?? null,
                $input['phone'] ?? null,
                json_encode($input['qualifications'] ?? []),
                $input['isActive'] ? 1 : 0,
                json_encode($input['availableDays'] ?? []),
                $input['notes'] ?? null,
                $segments[1]
            ]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Trainer updated']);
            } else {
                jsonResponse(false, null, 'Trainer not found or no changes', 404);
            }
            break;

        case 'DELETE':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Trainer ID required', 400);
            }
            
            $stmt = $pdo->prepare('DELETE FROM trainers WHERE id = ?');
            $result = $stmt->execute([$segments[1]]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Trainer deleted']);
            } else {
                jsonResponse(false, null, 'Trainer not found', 404);
            }
            break;

        default:
            jsonResponse(false, null, 'Method not allowed', 405);
    }
}

// Courses handlers
function handleCourses($method, $segments, $pdo) {
    $user = authenticate();
    if (!$user) {
        jsonResponse(false, null, 'Authentication required', 401);
    }

    switch ($method) {
        case 'GET':
            if (isset($segments[1]) && $segments[1] === 'week-plan') {
                // Get week plan
                $date = $_GET['date'] ?? date('Y-m-d');
                
                $stmt = $pdo->query('
                    SELECT c.*, 
                           GROUP_CONCAT(t.name) as assigned_trainers,
                           COUNT(wa.trainer_id) as assigned_count
                    FROM courses c
                    LEFT JOIN weekly_assignments wa ON c.id = wa.course_id 
                        AND wa.week_date = STR_TO_DATE(?, "%Y-%m-%d")
                    LEFT JOIN trainers t ON wa.trainer_id = t.id
                    WHERE c.is_active = 1
                    GROUP BY c.id
                    ORDER BY FIELD(c.day, "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"), c.start_time
                ');
                $stmt->execute([$date]);
                $courses = $stmt->fetchAll();
                
                foreach ($courses as &$course) {
                    $course['required_qualifications'] = json_decode($course['required_qualifications'] ?? '[]', true);
                    $course['assigned_trainers'] = $course['assigned_trainers'] ? explode(',', $course['assigned_trainers']) : [];
                    $course['missing_trainers'] = max(0, $course['required_trainers'] - $course['assigned_count']);
                    
                    if ($course['assigned_count'] >= $course['required_trainers']) {
                        $course['status'] = 'full';
                    } elseif ($course['assigned_count'] > 0) {
                        $course['status'] = 'partial';
                    } else {
                        $course['status'] = 'empty';
                    }
                }
                
                jsonResponse(true, ['weekStart' => $date, 'courses' => $courses]);
                
            } elseif (isset($segments[1]) && is_numeric($segments[1])) {
                // Get single course
                $stmt = $pdo->prepare('SELECT * FROM courses WHERE id = ?');
                $stmt->execute([$segments[1]]);
                $course = $stmt->fetch();
                
                if ($course) {
                    $course['required_qualifications'] = json_decode($course['required_qualifications'] ?? '[]', true);
                    jsonResponse(true, $course);
                } else {
                    jsonResponse(false, null, 'Course not found', 404);
                }
            } else {
                // Get all courses
                $stmt = $pdo->query('SELECT * FROM courses ORDER BY FIELD(day, "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"), start_time');
                $courses = $stmt->fetchAll();
                
                foreach ($courses as &$course) {
                    $course['required_qualifications'] = json_decode($course['required_qualifications'] ?? '[]', true);
                }
                
                jsonResponse(true, $courses);
            }
            break;

        case 'POST':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                INSERT INTO courses (name, description, day, start_time, end_time, max_participants, required_trainers, required_qualifications, is_active, location, age_group, level, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ');
            
            $result = $stmt->execute([
                $input['name'],
                $input['description'] ?? null,
                $input['day'],
                $input['startTime'],
                $input['endTime'],
                $input['maxParticipants'],
                $input['requiredTrainers'],
                json_encode($input['requiredQualifications'] ?? []),
                $input['isActive'] ? 1 : 0,
                $input['location'] ?? null,
                $input['ageGroup'] ?? null,
                $input['level'] ?? null,
                $input['notes'] ?? null
            ]);
            
            if ($result) {
                $id = $pdo->lastInsertId();
                jsonResponse(true, ['id' => $id, 'message' => 'Course created']);
            } else {
                jsonResponse(false, null, 'Failed to create course', 500);
            }
            break;

        case 'PUT':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Course ID required', 400);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                UPDATE courses 
                SET name = ?, description = ?, day = ?, start_time = ?, end_time = ?, max_participants = ?, required_trainers = ?, required_qualifications = ?, is_active = ?, location = ?, age_group = ?, level = ?, notes = ?, updated_at = NOW()
                WHERE id = ?
            ');
            
            $result = $stmt->execute([
                $input['name'],
                $input['description'] ?? null,
                $input['day'],
                $input['startTime'],
                $input['endTime'],
                $input['maxParticipants'],
                $input['requiredTrainers'],
                json_encode($input['requiredQualifications'] ?? []),
                $input['isActive'] ? 1 : 0,
                $input['location'] ?? null,
                $input['ageGroup'] ?? null,
                $input['level'] ?? null,
                $input['notes'] ?? null,
                $segments[1]
            ]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Course updated']);
            } else {
                jsonResponse(false, null, 'Course not found or no changes', 404);
            }
            break;

        case 'DELETE':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Course ID required', 400);
            }
            
            $stmt = $pdo->prepare('DELETE FROM courses WHERE id = ?');
            $result = $stmt->execute([$segments[1]]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Course deleted']);
            } else {
                jsonResponse(false, null, 'Course not found', 404);
            }
            break;

        default:
            jsonResponse(false, null, 'Method not allowed', 405);
    }
}

// Assignments handlers
function handleAssignments($method, $segments, $pdo) {
    $user = authenticate();
    if (!$user) {
        jsonResponse(false, null, 'Authentication required', 401);
    }

    switch ($method) {
        case 'POST':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                INSERT INTO weekly_assignments (course_id, trainer_id, week_date, is_substitute, notes, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ');
            
            $result = $stmt->execute([
                $input['courseId'],
                $input['trainerId'],
                $input['weekDate'],
                $input['isSubstitute'] ? 1 : 0,
                $input['notes'] ?? null
            ]);
            
            if ($result) {
                jsonResponse(true, ['id' => $pdo->lastInsertId(), 'message' => 'Assignment created']);
            } else {
                jsonResponse(false, null, 'Failed to create assignment', 500);
            }
            break;

        case 'DELETE':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Assignment ID required', 400);
            }
            
            $stmt = $pdo->prepare('DELETE FROM weekly_assignments WHERE id = ?');
            $result = $stmt->execute([$segments[1]]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Assignment deleted']);
            } else {
                jsonResponse(false, null, 'Assignment not found', 404);
            }
            break;

        default:
            jsonResponse(false, null, 'Method not allowed', 405);
    }
}

// Absences handlers (simplified)
function handleAbsences($method, $segments, $pdo) {
    $user = authenticate();
    if (!$user) {
        jsonResponse(false, null, 'Authentication required', 401);
    }

    switch ($method) {
        case 'GET':
            $stmt = $pdo->query('SELECT a.*, t.name as trainer_name FROM absences a JOIN trainers t ON a.trainer_id = t.id ORDER BY a.start_date DESC');
            $absences = $stmt->fetchAll();
            jsonResponse(true, $absences);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare('
                INSERT INTO absences (trainer_id, start_date, end_date, reason, is_approved, notes, created_at)
                VALUES (?, ?, ?, ?, 0, ?, NOW())
            ');
            
            $result = $stmt->execute([
                $input['trainerId'],
                $input['startDate'],
                $input['endDate'],
                $input['reason'],
                $input['notes'] ?? null
            ]);
            
            if ($result) {
                jsonResponse(true, ['id' => $pdo->lastInsertId(), 'message' => 'Absence created']);
            } else {
                jsonResponse(false, null, 'Failed to create absence', 500);
            }
            break;

        case 'DELETE':
            if (!$user['isAdmin']) {
                jsonResponse(false, null, 'Admin access required', 403);
            }
            
            if (!isset($segments[1]) || !is_numeric($segments[1])) {
                jsonResponse(false, null, 'Absence ID required', 400);
            }
            
            $stmt = $pdo->prepare('DELETE FROM absences WHERE id = ?');
            $result = $stmt->execute([$segments[1]]);
            
            if ($result && $stmt->rowCount() > 0) {
                jsonResponse(true, ['message' => 'Absence deleted']);
            } else {
                jsonResponse(false, null, 'Absence not found', 404);
            }
            break;

        default:
            jsonResponse(false, null, 'Method not allowed', 405);
    }
}

// Stats handlers
function handleStats($method, $segments, $pdo) {
    $user = authenticate();
    if (!$user) {
        jsonResponse(false, null, 'Authentication required', 401);
    }

    if ($method === 'GET' && $segments[1] === 'dashboard') {
        $stats = [];
        
        // Count trainers
        $stmt = $pdo->query('SELECT COUNT(*) as total, SUM(is_active) as active FROM trainers');
        $trainerStats = $stmt->fetch();
        $stats['totalTrainers'] = $trainerStats['total'];
        $stats['activeTrainers'] = $trainerStats['active'];
        
        // Count courses
        $stmt = $pdo->query('SELECT COUNT(*) as total, SUM(is_active) as active FROM courses');
        $courseStats = $stmt->fetch();
        $stats['totalCourses'] = $courseStats['total'];
        $stats['activeCourses'] = $courseStats['active'];
        
        // Count weekly assignments
        $stmt = $pdo->query('SELECT COUNT(*) as total FROM weekly_assignments WHERE week_date = CURDATE()');
        $assignmentStats = $stmt->fetch();
        $stats['weeklyAssignments'] = $assignmentStats['total'];
        
        // Count pending absences
        $stmt = $pdo->query('SELECT COUNT(*) as total FROM absences WHERE is_approved = 0');
        $absenceStats = $stmt->fetch();
        $stats['pendingAbsences'] = $absenceStats['total'];
        
        jsonResponse(true, $stats);
    } else {
        jsonResponse(false, null, 'Invalid stats endpoint', 404);
    }
}

?>
