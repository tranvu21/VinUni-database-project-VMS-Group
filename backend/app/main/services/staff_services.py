from services.auth_services import AuthService
from models import Staff, db
from datetime import date

class StaffService:
    @staticmethod
    def get_all_staff():
        staff_members = Staff.query.all()
        return [staff.to_dict() for staff in staff_members]
    
    @staticmethod
    def get_staff_by_id(staff_id):
        staff = Staff.query.get(staff_id)
        if staff:
            return staff.to_dict(), 200
        return {"message": "Staff member not found"}, 404
    
    @staticmethod
    def create_staff(data):
        try:
            # Process date string
            if 'hire_date' in data and isinstance(data['hire_date'], str):
                data['hire_date'] = date.fromisoformat(data['hire_date'])
                
            result, status_code = AuthService.register_user(data, Staff)
            
            if result['success']:
                # Get the newly created staff
                new_staff = Staff.query.filter_by(email=data['email']).first()
                return new_staff.to_dict(), 201
            
            return result, status_code
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating staff member: {str(e)}"}, 500
    
    @staticmethod
    def update_staff(staff_id, data):
        staff = Staff.query.get(staff_id)
        
        if not staff:
            return {"message": "Staff member not found"}, 404
        
        try:
            # Process date if present
            if 'hire_date' in data and isinstance(data['hire_date'], str):
                data['hire_date'] = date.fromisoformat(data['hire_date'])
            
            # Update staff attributes
            for key, value in data.items():
                if hasattr(staff, key) and key != 'id' and key != 'password':
                    setattr(staff, key, value)
            
            # Handle password separately
            if 'password' in data:
                staff.password = data['password']
            
            db.session.commit()
            return staff.to_dict(), 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating staff member: {str(e)}"}, 500
    
    @staticmethod
    def delete_staff(staff_id):
        staff = Staff.query.get(staff_id)
        
        if not staff:
            return {"message": "Staff member not found"}, 404
        
        try:
            db.session.delete(staff)
            db.session.commit()
            return {"message": "Staff member deleted successfully"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting staff member: {str(e)}"}, 500
