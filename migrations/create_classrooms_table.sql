-- Migration: Create classrooms table
-- Date: 2025-12-03

CREATE TABLE IF NOT EXISTS classrooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classroom_name VARCHAR(100) NULL COMMENT 'Descriptive name like Fewa, Tilicho, Rara, etc.',
    room_number VARCHAR(50) NOT NULL,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(20) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    rows INT NOT NULL CHECK (rows > 0) COMMENT 'Number of rows in the classroom for seating layout',
    columns INT NOT NULL CHECK (columns > 0) COMMENT 'Number of columns per row in the classroom for seating layout',
    type ENUM('Lecture Hall', 'Lab', 'Exam Hall', 'Auditorium', 'Classroom') NOT NULL DEFAULT 'Classroom',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room (room_number, building),
    INDEX idx_building (building),
    INDEX idx_available (is_available),
    INDEX idx_capacity (capacity),
    INDEX idx_classroom_name (classroom_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data (optional)
INSERT INTO classrooms (classroom_name, room_number, building, floor, capacity, rows, columns, type, is_available) VALUES
('Fewa', '101', 'Main Block', 'Ground Floor', 40, 5, 8, 'Classroom', true),
('Tilicho', '102', 'Main Block', 'Ground Floor', 40, 5, 8, 'Classroom', true),
('Rara', '201', 'Main Block', '1st Floor', 50, 5, 10, 'Lecture Hall', true),
('Annapurna', '202', 'Main Block', '1st Floor', 50, 5, 10, 'Lecture Hall', true),
('Nilgiri', 'Lab-A', 'IT Building', 'Ground Floor', 30, 5, 6, 'Lab', true),
('Manaslu', 'Lab-B', 'IT Building', 'Ground Floor', 30, 5, 6, 'Lab', true),
('Phewa Hall', '301', 'Main Block', '2nd Floor', 60, 6, 10, 'Exam Hall', true),
('Everest Auditorium', 'Auditorium', 'Main Block', 'Ground Floor', 200, 20, 10, 'Auditorium', true);
