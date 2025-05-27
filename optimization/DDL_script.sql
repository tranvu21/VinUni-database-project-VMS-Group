
-- =======================================
-- DATABASE SCHEMA SETUP (TABLE DEFINITIONS)
-- =======================================
USE uni;

CREATE TABLE Department (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    office_location VARCHAR(100)
);

CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'professor', 'admin') NOT NULL,
    CHECK (CHAR_LENGTH(username) >= 5),
    CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    major VARCHAR(100) NOT NULL,
    enrollment_year YEAR NOT NULL,
    gpa DECIMAL(3,2) DEFAULT 0.00,
    CHECK (gpa BETWEEN 0.00 AND 4.00),
    FOREIGN KEY (student_id) REFERENCES User(user_id)
);

CREATE TABLE Professor (
    professor_id INT PRIMARY KEY,
    department_id INT NOT NULL,
    salary DECIMAL(10,2) NOT NULL CHECK (salary > 0),
    FOREIGN KEY (professor_id) REFERENCES User(user_id),
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Faculty (
    faculty_id INT PRIMARY KEY,
    department_id INT NOT NULL,
    position VARCHAR(100) NOT NULL,  
    office VARCHAR(100),
    FOREIGN KEY (faculty_id) REFERENCES User(user_id),
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Course (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 10),
    department_id INT NOT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES Department(department_id),
    FOREIGN KEY (created_by) REFERENCES Professor(professor_id)
);

CREATE TABLE Section (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    professor_id INT NOT NULL,
    semester VARCHAR(10) NOT NULL,
    year YEAR NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registered_count INT DEFAULT 0,
    registration_deadline DATE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id),
    FOREIGN KEY (professor_id) REFERENCES Professor(professor_id)
);

CREATE TABLE Schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    room VARCHAR(50),
    day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (section_id) REFERENCES Section(section_id),
    CHECK (start_time < end_time)
);

CREATE TABLE Enrollment (
    student_id INT NOT NULL,
    section_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    enrolled_year INT,
    grade CHAR(2) CHECK (grade IN ('A', 'B', 'C', 'D', 'F', 'I', 'W')),
    PRIMARY KEY (student_id, section_id)
);

-- =======================================
-- TRIGGERS
-- =======================================
DELIMITER //

CREATE TRIGGER trg_check_registration_deadline
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE deadline DATE;
    SELECT registration_deadline INTO deadline
    FROM Section WHERE section_id = NEW.section_id;
    IF CURRENT_DATE() > deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registration deadline has passed';
    END IF;
END;
//

CREATE TRIGGER trg_check_section_capacity
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE curr INT; DECLARE cap INT;
    SELECT registered_count, capacity INTO curr, cap
    FROM Section WHERE section_id = NEW.section_id;
    IF curr >= cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Section is full';
    END IF;
END;
//

CREATE TRIGGER trg_increment_registered_count
AFTER INSERT ON Enrollment
FOR EACH ROW
BEGIN
    UPDATE Section SET registered_count = registered_count + 1
    WHERE section_id = NEW.section_id;
END;
//

CREATE TRIGGER trg_set_enrolled_year
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    SET NEW.enrolled_year = YEAR(NEW.enrolled_at);
END;
//

DELIMITER ;

-- =======================================
-- PROCEDURES
-- =======================================
DELIMITER //

DELIMITER //

CREATE PROCEDURE sp_simulate_bulk_enrollment(
    IN p_section_id INT,
    IN p_start_student_id INT,
    IN p_batch_size INT
)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE random_date DATE;

    WHILE i < p_batch_size DO
        SET random_date = DATE_ADD('2020-01-01', INTERVAL FLOOR(RAND() * 2190) DAY);
        -- 2190 = approx 6 years of days

        INSERT INTO Enrollment(student_id, section_id, enrolled_at)
        VALUES (p_start_student_id + i, p_section_id, random_date);

        SET i = i + 1;
    END WHILE;
END;
//

DELIMITER ;


-- =======================================
-- VIEWS
-- =======================================
CREATE OR REPLACE VIEW view_student_courses AS
SELECT 
    u.user_id AS student_id,
    u.full_name AS student_name,
    c.title AS course_title,
    s.section_id,
    s.semester,
    s.year,
    e.grade
FROM Enrollment e
JOIN User u ON e.student_id = u.user_id
JOIN Section s ON e.section_id = s.section_id
JOIN Course c ON s.course_id = c.course_id;


-- =============================
-- STEP 1: GENERATE FAKE DATA
-- =============================

-- Create a test department
INSERT INTO Department(name, office_location) VALUES ('Engineering', 'B101');

-- Insert 1000 students
DELIMITER //

//

DELIMITER ;
CALL sp_generate_students(1001, 2000);

SELECT * FROM Enrollment;
-- Create a test professor and section
INSERT INTO User (username, password, email, full_name, role)
VALUES ('prof1', 'password', 'prof1@uni.edu', 'Prof. One', 'professor');

SET @prof_id = LAST_INSERT_ID();

INSERT INTO Professor (professor_id, department_id, salary)
VALUES (@prof_id, 1, 2000.00);

INSERT INTO Course (title, description, credits, department_id, created_by)
VALUES ('Intro to Testing', 'Test course', 3, 1, @prof_id);

SET @course_id = LAST_INSERT_ID();

INSERT INTO Section (course_id, professor_id, semester, year, capacity, registration_deadline)
VALUES (@course_id, @prof_id, 'Fall', 2023, 1500, '2025-12-01');

SET @section_id = LAST_INSERT_ID();


-- =============================
-- STEP 2: RUN BASELINE TEST (NO INDEX)
-- =============================

SET @start_before = NOW(6);
CALL sp_simulate_bulk_enrollment(1, 1, 2000);
SELECT TIMESTAMPDIFF(MICROSECOND, @start_before, NOW(6)) AS no_index_time_us;
