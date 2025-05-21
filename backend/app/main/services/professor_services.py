from services.auth_services import AuthService
from models import Professor, db
from datetime import date

class ProfessorService:
    @staticmethod
    def get_all_professors():
        professors = Professor.query.all()
        return [professor.to_dict() for professor in professors]
    
    @staticmethod
    def get_professor_by_id(professor_id):
        professor = Professor.query.get(professor_id)
        if professor:
            return professor.to_dict(), 200
        return {"message": "Professor not found"}, 404
    
    @staticmethod
    def create_professor(data):
        try:
            # Process date string
            if 'hire_date' in data and isinstance(data['hire_date'], str):
                data['hire_date'] = date.fromisoformat(data['hire_date'])
                
            result, status_code = AuthService.register_user(data, Professor)
            
            if result['success']:
                # Get the newly created professor
                new_professor = Professor.query.filter_by(email=data['email']).first()
                return new_professor.to_dict(), 201
            
            return result, status_code
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating professor: {str(e)}"}, 500
    
    @staticmethod
    def update_professor(professor_id, data):
        professor = Professor.query.get(professor_id)
        
        if not professor:
            return {"message": "Professor not found"}, 404
        
        try:
            # Process date if present
            if 'hire_date' in data and isinstance(data['hire_date'], str):
                data['hire_date'] = date.fromisoformat(data['hire_date'])
            
            # Update professor attributes
            for key, value in data.items():
                if hasattr(professor, key) and key != 'id' and key != 'password':
                    setattr(professor, key, value)
            
            # Handle password separately
            if 'password' in data:
                professor.password = data['password']
            
            db.session.commit()
            return professor.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating professor: {str(e)}"}, 500
    
    @staticmethod
    def delete_professor(professor_id):
        professor = Professor.query.get(professor_id)
        
        if not professor:
            return {"message": "Professor not found"}, 404
        
        try:
            db.session.delete(professor)
            db.session.commit()
            return {"message": "Professor deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting professor: {str(e)}"}, 500
