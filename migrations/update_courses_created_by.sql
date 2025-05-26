-- Migration to update created_by foreign key in courses table
-- =====================================================

-- First, drop the existing foreign key constraint
ALTER TABLE courses
DROP CONSTRAINT IF EXISTS courses_created_by_fkey;

-- Then, add the new foreign key constraint to users table
ALTER TABLE courses
ADD CONSTRAINT courses_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES users(user_id);

-- Drop the existing view first
DROP VIEW IF EXISTS course_catalog;

-- Create the view with the new relationship
CREATE VIEW course_catalog AS
SELECT 
    c.course_id,
    c.title,
    c.description,
    c.credits,
    d.name as department_name,
    u.full_name as professor_name,  -- Keep the original column name for compatibility
    s.section_id,
    s.semester,
    s.year,
    s.capacity,
    s.registered_count,
    s.registration_deadline
FROM courses c
JOIN departments d ON c.department_id = d.department_id
JOIN users u ON c.created_by = u.user_id
LEFT JOIN sections s ON c.course_id = s.course_id
WHERE u.role IN ('professor', 'faculty');

-- Add a comment to document the change
COMMENT ON TABLE courses IS 'Updated created_by to reference users table directly instead of professors table'; 