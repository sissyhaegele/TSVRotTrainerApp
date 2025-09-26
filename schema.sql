-- TSV Rot Trainingsplan Datenbank Schema
CREATE DATABASE IF NOT EXISTS `tsvrot2025-database`;
USE `tsvrot2025-database`;

-- Tabelle für Trainer
CREATE TABLE IF NOT EXISTS trainers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabelle für Kurse
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    weekday ENUM('Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag') NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    required_trainers INT DEFAULT 1,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_weekday (weekday),
    INDEX idx_time (time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabelle für Optimal-Besetzung
CREATE TABLE IF NOT EXISTS course_trainer_defaults (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    trainer_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (course_id, trainer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabelle für Ausfälle
CREATE TABLE IF NOT EXISTS absences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainer_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabelle für wöchentliche Zuordnungen
CREATE TABLE IF NOT EXISTS weekly_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    trainer_id INT NOT NULL,
    assignment_date DATE NOT NULL,
    is_substitute BOOLEAN DEFAULT FALSE,
    notes VARCHAR(255),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_weekly (course_id, trainer_id, assignment_date),
    INDEX idx_date (assignment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabelle für Benutzer
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','trainer','viewer') DEFAULT 'viewer',
    trainer_id INT,
    last_login TIMESTAMP NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
