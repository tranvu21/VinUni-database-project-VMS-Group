from . import db
from .user import User

class Professor(User):
    __tablename__ = 'professors'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    employee_id = db.Column(db.String(20), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(50))  # Assistant, Associate, Full
    hire_date = db.Column(db.Date, nullable=False)
    research_area = db.Column(db.String(200))
    
    __mapper_args__ = {
        'polymorphic_identity': 'professor',
    }
    
    def to_dict(self):
        data = super().to_dict()
        professor_data = {
            'employee_id': self.employee_id,
            'department': self.department,
            'title': self.title,
            'hire_date': self.hire_date.isoformat() if self.hire_date else None,
            'research_area': self.research_area
        }
        data.update(professor_data)
        return data
