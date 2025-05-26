-- Add enrollment_id column to enrollments table
ALTER TABLE enrollments 
ADD COLUMN enrollment_id SERIAL UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_enrollments_enrollment_id ON enrollments(enrollment_id);

-- Update existing enrollments to have unique enrollment_ids
UPDATE enrollments 
SET enrollment_id = nextval('enrollments_enrollment_id_seq')
WHERE enrollment_id IS NULL; 