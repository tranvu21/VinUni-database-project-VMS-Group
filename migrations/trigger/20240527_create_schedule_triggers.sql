
-- ====================================
-- ADDITIONAL TRIGGERS
-- ====================================

DELIMITER //

-- Trigger: Prevent duplicate schedule entries for the same section, room, day, and time
CREATE TRIGGER trg_enforce_unique_schedule
BEFORE INSERT ON Schedule
FOR EACH ROW
BEGIN
    DECLARE cnt INT;
    SELECT COUNT(*) INTO cnt
    FROM Schedule
    WHERE section_id = NEW.section_id
      AND day_of_week = NEW.day_of_week
      AND start_time = NEW.start_time
      AND end_time = NEW.end_time
      AND room = NEW.room;

    IF cnt > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Schedule conflict: duplicate schedule entry exists.';
    END IF;
END;
//

-- Trigger: Automatically set default values or perform checks when a user is created
CREATE TRIGGER trg_on_user_create
BEFORE INSERT ON User
FOR EACH ROW
BEGIN
    -- Normalize email to lowercase
    SET NEW.email = LOWER(NEW.email);

    -- Ensure full name is properly trimmed
    SET NEW.full_name = TRIM(NEW.full_name);
END;
//

DELIMITER ;
