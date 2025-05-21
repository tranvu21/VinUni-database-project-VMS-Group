from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
student_bp = Blueprint('student', __name__, url_prefix='/api/students')
professor_bp = Blueprint('professor', __name__, url_prefix='/api/professors')
staff_bp = Blueprint('staff', __name__, url_prefix='/api/staff')

# Import routes to register them with blueprints
from routes import auth, student, professor, staff
