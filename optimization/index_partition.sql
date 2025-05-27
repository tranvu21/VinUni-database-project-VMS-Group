-- =============================
-- STEP 3: ADD INDEXES + PARTITIONING
-- =============================
USE uni;
-- Indexes
CREATE INDEX idx_user_full_name ON User(full_name);
CREATE INDEX idx_enrollment_section ON Enrollment(section_id);

-- Add enrolled_year column (if not already)

-- Trigger to populate enrolled_year already assumed in schema

-- Backfill enrolled_year for existing data
UPDATE Enrollment SET enrolled_year = YEAR(enrolled_at) WHERE enrolled_year IS NULL;


-- ALTER TABLE Enrollment DROP FOREIGN KEY ...;
ALTER TABLE Enrollment
DROP PRIMARY KEY,
ADD PRIMARY KEY (student_id, section_id, enrolled_year);

-- Partition Enrollment table by year
ALTER TABLE Enrollment
PARTITION BY RANGE (enrolled_year) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);


-- =============================
-- STEP 4: TEST AFTER OPTIMIZATION
-- =============================

SET @start_before = NOW(6);
CALL sp_simulate_bulk_enrollment(1, 8001, 2000);
SELECT TIMESTAMPDIFF(MICROSECOND, @start_before, NOW(6)) AS optimized_time;