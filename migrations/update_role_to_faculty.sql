-- Migration to update role from admin to faculty
-- =====================================================

-- First, update any existing admin users to faculty
UPDATE users
SET role = 'faculty'
WHERE role = 'admin';

-- Then, modify the role check constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('student', 'professor', 'faculty'));

-- Update any views or functions that reference the role
CREATE OR REPLACE VIEW course_catalog AS
SELECT 
    c.course_id,
    c.title,
    c.description,
    c.credits,
    d.name as department_name,
    u.full_name as professor_name,
    s.section_id,
    s.semester,
    s.year,
    s.capacity,
    s.registered_count,
    s.registration_deadline
FROM courses c
JOIN departments d ON c.department_id = d.department_id
JOIN professors p ON c.created_by = p.professor_id
JOIN users u ON p.professor_id = u.user_id
LEFT JOIN sections s ON c.course_id = s.course_id
WHERE u.role IN ('professor', 'faculty');

-- Update any other views or functions that might reference the role
CREATE OR REPLACE VIEW department_stats AS
SELECT 
    d.department_id,
    d.name as department_name,
    COUNT(DISTINCT CASE WHEN u.role = 'professor' THEN u.user_id END) as professor_count,
    COUNT(DISTINCT CASE WHEN u.role = 'faculty' THEN u.user_id END) as faculty_count,
    COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.user_id END) as student_count,
    COUNT(DISTINCT c.course_id) as course_count
FROM departments d
LEFT JOIN professors p ON d.department_id = p.department_id
LEFT JOIN users u ON p.professor_id = u.user_id
LEFT JOIN courses c ON d.department_id = c.department_id
GROUP BY d.department_id, d.name;

-- Add a comment to document the change
COMMENT ON TABLE users IS 'Updated role options: student, professor, faculty (previously included admin)'; 