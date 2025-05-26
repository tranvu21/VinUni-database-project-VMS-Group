-- Migration to update student_id foreign key in enrollments table
-- =====================================================

-- First, drop the existing foreign key constraint
ALTER TABLE enrollments
DROP CONSTRAINT IF EXISTS enrollments_student_id_fkey;

-- Then, add the new foreign key constraint to users table
ALTER TABLE enrollments
ADD CONSTRAINT enrollments_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES users(user_id);

-- Update any views that might reference this relationship
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
JOIN users u ON c.created_by = u.user_id
LEFT JOIN sections s ON c.course_id = s.course_id
LEFT JOIN users p ON s.professor_id = p.user_id
WHERE u.role IN ('professor', 'faculty');

-- Add a comment to document the change
COMMENT ON TABLE enrollments IS 'Updated student_id to reference users table directly instead of students table'; 