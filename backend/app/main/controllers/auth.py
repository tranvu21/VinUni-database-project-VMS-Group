from flask import request, jsonify
from controllers import auth_bp
from services.auth_services import AuthService

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"message": "Email and password are required"}), 400
    
    result, status_code = AuthService.login(data['email'], data['password'])
    return jsonify(result), status_code
