<?php
// config.php - TSV 1905 Rot e.V. Database Configuration
// © 2024 Sissy Hägele

error_reporting(E_ALL);
ini_set('display_errors', 1);

class Database {
    private $connection;
    
    public function __construct() {
        $host = getenv('DB_HOST') ?: 'tsvrot2025-server.mysql.database.azure.com';
        $username = getenv('DB_USER') ?: 'sqladmin';
        $password = getenv('DB_PASSWORD');
        $database = getenv('DB_NAME') ?: 'tsvrot_db';
        
        try {
            $this->connection = new mysqli($host, $username, $password, $database);
            
            if ($this->connection->connect_error) {
                throw new Exception("Connection failed: " . $this->connection->connect_error);
            }
            
            $this->connection->set_charset("utf8mb4");
            
        } catch (Exception $e) {
            die(json_encode([
                'error' => 'Database connection failed',
                'message' => $e->getMessage()
            ]));
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function query($sql) {
        $result = $this->connection->query($sql);
        if ($this->connection->error) {
            throw new Exception($this->connection->error);
        }
        return $result;
    }
}
