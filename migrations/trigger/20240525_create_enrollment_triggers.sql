
-- ============================
-- TRIGGERS: Enrollment Rules
-- ============================

DELIMITER //

-- Trigger 1: Check registration deadline
CREATE TRIGGER trg_check_registration_deadline
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE deadline DATE;
    SELECT registration_deadline
    INTO deadline
    FROM Section
    WHERE section_id = NEW.section_id;

    IF CURRENT_DATE() > deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registration deadline has passed for this section.';
    END IF;
END;
//

-- Trigger 2: Check section capacity
CREATE TRIGGER trg_check_section_capacity
BEFORE INSERT ON Enrollment
FOR EACH ROW
BEGIN
    DECLARE curr_count INT;
    DECLARE max_cap INT;

    SELECT registered_count, capacity
    INTO curr_count, max_cap
    FROM Section
    WHERE section_id = NEW.section_id;

    IF curr_count >= max_cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This section is already full.';
    END IF;
END;
//

-- Trigger 3: Decrease registered count after withdrawal
CREATE TRIGGER trg_after_enrollment_delete
AFTER DELETE ON Enrollment
FOR EACH ROW
BEGIN
    UPDATE Section
    SET registered_count = registered_count - 1
    WHERE section_id = OLD.section_id;
END;
//

-- Trigger 4: Auto-increase registered count on insert
CREATE TRIGGER trg_increment_registered_count
AFTER INSERT ON Enrollment
FOR EACH ROW
BEGIN
    UPDATE Section
    SET registered_count = registered_count + 1
    WHERE section_id = NEW.section_id;
END;
//

DELIMITER ;
