-- Migration: Create exams table for exam seat planning
-- Date: 2025-12-05

CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(200) NOT NULL COMMENT 'Subject name (e.g., Data Structures, Artificial Intelligence)',
    module_code VARCHAR(50) NOT NULL COMMENT 'Module/course code (e.g., CS301, BBA201)',
    exam_date DATE NOT NULL COMMENT 'Date of the exam',
    start_time TIME NOT NULL COMMENT 'Exam start time',
    end_time TIME NOT NULL COMMENT 'Exam end time',
    duration INT NOT NULL COMMENT 'Duration in minutes',
    exam_type ENUM('Final', 'Midterm', 'Sessional') NOT NULL DEFAULT 'Final' COMMENT 'Type of examination',
    faculty ENUM('BIT', 'BBA') NOT NULL COMMENT 'Faculty/Program (BIT or BBA)',
    year ENUM('1st', '2nd', '3rd') NOT NULL COMMENT 'Academic year',
    semester VARCHAR(50) NOT NULL COMMENT 'Semester - can be "1st", "2nd", or JSON array ["1st","2nd"] for both',
    section VARCHAR(20) DEFAULT 'all' COMMENT 'Section filter - "all" or specific section like "A", "B"',
    total_students INT NOT NULL DEFAULT 0 COMMENT 'Total number of eligible students',
    status ENUM('draft', 'allocated', 'published') NOT NULL DEFAULT 'draft' COMMENT 'Exam status - draft, allocated (seats assigned), published (visible to students)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_exam_date (exam_date),
    INDEX idx_status (status),
    INDEX idx_faculty_year (faculty, year),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores exam information for seat planning and allocation';

-- Sample data for testing (optional)
INSERT INTO exams (subject, module_code, exam_date, start_time, end_time, duration, exam_type, faculty, year, semester, section, total_students, status) VALUES
('Artificial Intelligence', 'CS401', '2025-12-20', '10:00:00', '13:00:00', 180, 'Final', 'BIT', '3rd', '2nd', 'all', 95, 'draft'),
('Database Management Systems', 'CS301', '2025-12-18', '09:00:00', '12:00:00', 180, 'Midterm', 'BIT', '2nd', '1st', 'all', 120, 'draft'),
('Business Analytics', 'BBA301', '2025-12-22', '14:00:00', '17:00:00', 180, 'Final', 'BBA', '3rd', '2nd', 'all', 85, 'draft');
