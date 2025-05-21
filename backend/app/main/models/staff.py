from . import db
from .user import User

class Staff(User):
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100), nullable=False)
    hire_date = db.Column(db.Date, nullable=False)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=True)
    
    # Self-referential relationship for supervisor/subordinate
    supervisor = db.relationship('Staff', remote_side=[id], backref='subordinates')
    
    __mapper_args__ = {
        'polymorphic_identity': 'staff',
    }
    
    def to_dict(self):
        data = super().to_dict()
        staff_data = {
            'employee_id': self.employee_id,
            'department': self.department,
            'position': self.position,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'supervisor_id': self.supervisor_id
        }
        data.update(staff_data)
        return data
