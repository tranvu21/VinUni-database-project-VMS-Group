from services.auth_services import AuthService
from models import Student, db
from datetime import date

class StudentService:
    @staticmethod
    def get_all_students():
        students = Student.query.all()
        return [student.to_dict() for student in students]
    
    @staticmethod
    def get_student_by_id(student_id):
        student = Student.query.get(student_id)
        if student:
            return student.to_dict(), 200
        return {"message": "Student not found"}, 404
    
    @staticmethod
    def create_student(data):
        try:
            # Process date string
            if 'enrollment_date' in data and isinstance(data['enrollment_date'], str):
                data['enrollment_date'] = date.fromisoformat(data['enrollment_date'])
                
            result, status_code = AuthService.register_user(data, Student)
            
            if result['success']:
                # Get the newly created student
                new_student = Student.query.filter_by(email=data['email']).first()
                return new_student.to_dict(), 201
            
            return result, status_code
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating student: {str(e)}"}, 500
    
    @staticmethod
    def update_student(student_id, data):
        student = Student.query.get(student_id)
        
        if not student:
            return {"message": "Student not found"}, 404
        
        try:
            # Process date if present
            if 'enrollment_date' in data and isinstance(data['enrollment_date'], str):
                data['enrollment_date'] = date.fromisoformat(data['enrollment_date'])
            
            # Update student attributes
            for key, value in data.items():
                if hasattr(student, key) and key != 'id' and key != 'password':
                    setattr(student, key, value)
            
            # Handle password separately
            if 'password' in data:
                student.password = data['password']
            
            db.session.commit()
            return student.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating student: {str(e)}"}, 500
    
    @staticmethod
    def delete_student(student_id):
        student = Student.query.get(student_id)
        
        if not student:
            return {"message": "Student not found"}, 404
        
        try:
            db.session.delete(student)
            db.session.commit()
            return {"message": "Student deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting student: {str(e)}"}, 500
