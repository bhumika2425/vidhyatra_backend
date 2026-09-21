-- Migration: Create seat_allocations table for exam seat planning
-- Date: 2025-12-05

CREATE TABLE IF NOT EXISTS seat_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL COMMENT 'Foreign key to exams table',
    student_id INT NOT NULL COMMENT 'Student ID from icp_students database',
    college_id VARCHAR(50) NOT NULL COMMENT 'Student college ID (e.g., BIT2021001)',
    student_name VARCHAR(200) NOT NULL COMMENT 'Student full name',
    classroom_id INT NOT NULL COMMENT 'Foreign key to classrooms table',
    seat_number INT NOT NULL COMMENT 'Seat number within the classroom',
    row_number INT NOT NULL COMMENT 'Row number in the classroom seating layout',
    column_number INT NOT NULL COMMENT 'Column number in the classroom seating layout',
    allocation_strategy ENUM('random_mixed', 'section_separated', 'roll_number') NOT NULL COMMENT 'Strategy used for seat allocation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE RESTRICT,
    
    -- Unique constraint to prevent duplicate seat assignments
    UNIQUE KEY unique_exam_student (exam_id, student_id),
    UNIQUE KEY unique_exam_classroom_seat (exam_id, classroom_id, seat_number),
    
    -- Indexes for better query performance
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id),
    INDEX idx_classroom_id (classroom_id),
    INDEX idx_college_id (college_id),
    INDEX idx_exam_classroom (exam_id, classroom_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores seat allocation assignments for exams';

-- Sample data will be inserted after allocation algorithm runs
-- No sample data here as allocations are generated dynamically
