
-- ==========================
-- PROCEDURES: Student Tasks
-- ==========================

-- Procedure 1: Register a student to a section
DELIMITER //
CREATE PROCEDURE sp_register_student_to_section(
    IN p_student_id INT,
    IN p_section_id INT
)
BEGIN
    INSERT INTO Enrollment(student_id, section_id)
    VALUES (p_student_id, p_section_id);
END;
//

-- Procedure 2: Update student grade (professors only)
CREATE PROCEDURE sp_update_student_grade(
    IN p_professor_id INT,
    IN p_section_id INT,
    IN p_student_id INT,
    IN p_grade CHAR(2)
)
BEGIN
    DECLARE v_prof INT;

    SELECT professor_id
    INTO v_prof
    FROM Section
    WHERE section_id = p_section_id;

    IF v_prof != p_professor_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized professor for this section.';
    ELSE
        UPDATE Enrollment
        SET grade = p_grade
        WHERE student_id = p_student_id
          AND section_id = p_section_id;
    END IF;
END;
//

-- Procedure 3: Add a new student account
CREATE PROCEDURE sp_add_student(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_full_name VARCHAR(100),
    IN p_major VARCHAR(100),
    IN p_enrollment_year YEAR
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO User (username, password, email, full_name, role)
    VALUES (p_username, p_password, p_email, p_full_name, 'student');

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO Student (student_id, major, enrollment_year)
    VALUES (new_user_id, p_major, p_enrollment_year);
END;
//
DELIMITER ;
