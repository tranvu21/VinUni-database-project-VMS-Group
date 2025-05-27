
-- =======================
-- VIEWS: Course & Student
-- =======================

-- View 1: Student's enrolled courses
CREATE OR REPLACE VIEW view_student_courses AS
SELECT 
    u.user_id AS student_id,
    u.full_name AS student_name,
    c.title AS course_title,
    s.section_id,
    s.semester,
    s.year,
    sch.day_of_week,
    sch.start_time,
    sch.end_time,
    e.grade
FROM Enrollment e
JOIN User u ON e.student_id = u.user_id
JOIN Section s ON e.section_id = s.section_id
JOIN Course c ON s.course_id = c.course_id
LEFT JOIN Schedule sch ON s.section_id = sch.section_id
WHERE u.role = 'student';

-- View 2: Professor's teaching sections
CREATE OR REPLACE VIEW view_professor_sections AS
SELECT 
    u.user_id AS professor_id,
    u.full_name AS professor_name,
    c.course_id,
    c.title AS course_title,
    s.section_id,
    s.semester,
    s.year
FROM Section s
JOIN Course c ON s.course_id = c.course_id
JOIN Professor p ON s.professor_id = p.professor_id
JOIN User u ON p.professor_id = u.user_id
WHERE u.role = 'professor';
-- View: Course sections overview for faculty
CREATE OR REPLACE VIEW view_faculty_sections AS
SELECT 
    c.course_id,
    c.title AS course_title,
    s.section_id,
    s.semester,
    s.year,
    s.capacity,
    s.registered_count,
    s.registration_deadline,
    u.full_name AS professor_name
FROM Course c
JOIN Section s ON c.course_id = s.course_id
LEFT JOIN Professor p ON s.professor_id = p.professor_id
LEFT JOIN User u ON p.professor_id = u.user_id;

-- View: All users for faculty
CREATE OR REPLACE VIEW view_all_users_for_faculty AS
SELECT 
    u.user_id,
    u.username,
    u.full_name,
    u.email,
    u.role,
    s.major,
    s.enrollment_year,
    s.gpa,
    p.department_id AS professor_department,
    p.salary,
    f.position,
    f.office
FROM User u
LEFT JOIN Student s ON u.user_id = s.student_id
LEFT JOIN Professor p ON u.user_id = p.professor_id
LEFT JOIN Faculty f ON u.user_id = f.faculty_id;
