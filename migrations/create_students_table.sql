-- Students Master Table (All college students, not just app users)
CREATE TABLE IF NOT EXISTS students (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Student Identity
  college_id VARCHAR(50) UNIQUE NOT NULL,  -- Roll number/Student ID
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Academic Info
  faculty VARCHAR(50) NOT NULL,  -- BIT, BBA
  year VARCHAR(20) NOT NULL,     -- 1st Year, 2nd Year, 3rd Year
  semester VARCHAR(20) NOT NULL, -- Semester 1, Semester 2
  section VARCHAR(10),           -- A, B, C, or NULL
  
  -- Link to app user (nullable)
  user_id INT NULL,  -- Links to users table if student registered in app
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,  -- Active enrollment
  enrollment_date DATE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_college_id (college_id),
  INDEX idx_academic (faculty, year, semester),
  INDEX idx_user_id (user_id)
);

-- Sample data
INSERT INTO students (college_id, student_name, email, faculty, year, semester, section, user_id) VALUES
('BIT001', 'Saurabh Gurung', 'saurabh.gurung.a22@icp.edu.np', 'BIT', '3rd Year', 'Semester 2', 'C4', 4),
('BIT002', 'Ram Kumar', 'ram@example.com', 'BIT', '3rd Year', 'Semester 2', 'C4', NULL),
('BIT003', 'Sita Sharma', 'sita@example.com', 'BIT', '3rd Year', 'Semester 2', 'C4', NULL),
('BBA001', 'Hari Prasad', 'hari@example.com', 'BBA', '2nd Year', 'Semester 1', 'A', NULL);
