DELIMITER //

CREATE TRIGGER trg_on_user_delete
AFTER DELETE ON User
FOR EACH ROW
BEGIN
    DELETE FROM Student WHERE student_id = OLD.user_id;
    DELETE FROM Professor WHERE professor_id = OLD.user_id;
    DELETE FROM Faculty WHERE faculty_id = OLD.user_id;
END;
//

DELIMITER ;

    