
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
