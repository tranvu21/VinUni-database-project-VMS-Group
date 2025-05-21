from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from models import db, bcrypt
from config import Config
from controllers import auth_bp, student_bp, professor_bp, staff_bp
from flask_migrate import Migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(professor_bp)
    app.register_blueprint(staff_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"message": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"message": "Internal server error"}), 500
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"message": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"message": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message": "Missing authorization token"}), 401
    
    # Create a basic route for checking API status
    @app.route('/api/status', methods=['GET'])
    def status():
        return jsonify({
            "status": "online",
            "message": "University Management System API is running"
        })
    
    return app

# MySQL database initialization script
def init_db(app):
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    app = create_app()
    
    # Uncomment the line below to initialize the database when first running
    # init_db(app)
    
    app.run(debug=True)
