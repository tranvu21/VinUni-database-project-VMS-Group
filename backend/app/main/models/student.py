from . import db
from .user import User

class Student(User):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    major = db.Column(db.String(100))
    enrollment_date = db.Column(db.Date, nullable=False)
    graduation_year = db.Column(db.Integer)
    gpa = db.Column(db.Float)
    
    __mapper_args__ = {
        'polymorphic_identity': 'student',
    }
    
    def to_dict(self):
        data = super().to_dict()
        student_data = {
            'student_id': self.student_id,
            'major': self.major,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'graduation_year': self.graduation_year,
            'gpa': self.gpa
        }
        data.update(student_data)
        return data
