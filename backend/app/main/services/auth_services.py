from flask_jwt_extended import create_access_token
from models import User, db

class AuthService:
    @staticmethod
    def register_user(data, user_class):
        # Check if user with the email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return {'success': False, 'message': 'Email already registered'}, 409
        
        try:
            # Create new user instance
            new_user = user_class(**data)
            
            # Set password using the property setter
            new_user.password = data['password']
            
            # Add to database
            db.session.add(new_user)
            db.session.commit()
            
            return {'success': True, 'message': 'User registered successfully'}, 201
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}, 500
    
    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email).first()
        
        if user and user.verify_password(password):
            # Create access token
            access_token = create_access_token(
                identity={'id': user.id, 'role': user.role, 'email': user.email}
            )
            return {
                'success': True,
                'access_token': access_token,
                'user': user.to_dict()
            }, 200
        
        return {'success': False, 'message': 'Invalid credentials'}, 401