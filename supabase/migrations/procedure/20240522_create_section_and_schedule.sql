CREATE PROCEDURE sp_faculty_create_course_and_section(
    IN p_title VARCHAR(100),
    IN p_description TEXT,
    IN p_credits INT,
    IN p_department_id INT,
    IN p_created_by INT,
    IN p_semester VARCHAR(10),
    IN p_year YEAR,
    IN p_capacity INT,
    IN p_registration_deadline DATE,
    IN p_professor_id INT
)
BEGIN
    DECLARE new_course_id INT;
    DECLARE new_section_id INT;

    INSERT INTO Course (title, description, credits, department_id, created_by)
    VALUES (p_title, p_description, p_credits, p_department_id, p_created_by);

    SET new_course_id = LAST_INSERT_ID();

    INSERT INTO Section (course_id, semester, year, capacity, registration_deadline, professor_id)
    VALUES (new_course_id, p_semester, p_year, p_capacity, p_registration_deadline, p_professor_id);
END;

CREATE PROCEDURE sp_professor_manage_schedule(
    IN p_section_id INT,
    IN p_days TEXT,         -- e.g. 'Mon,Tue'
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_room VARCHAR(50)
)
BEGIN
    DECLARE day TEXT;
    WHILE LOCATE(',', p_days) > 0 DO
        SET day = SUBSTRING_INDEX(p_days, ',', 1);
        SET p_days = SUBSTRING(p_days, LOCATE(',', p_days) + 1);
        INSERT INTO Schedule(section_id, day_of_week, start_time, end_time, room)
        VALUES (p_section_id, day, p_start_time, p_end_time, p_room);
    END WHILE;
    INSERT INTO Schedule(section_id, day_of_week, start_time, end_time, room)
    VALUES (p_section_id, p_days, p_start_time, p_end_time, p_room);
END;