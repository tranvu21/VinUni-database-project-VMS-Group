from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers import professor_bp
from services.professor_services import ProfessorService

@professor_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_professors():
    current_user = get_jwt_identity()
    # Check for appropriate permissions
    
    professors = ProfessorService.get_all_professors()
    return jsonify(professors), 200

@professor_bp.route('/<int:professor_id>', methods=['GET'])
@jwt_required()
def get_professor(professor_id):
    result, status_code = ProfessorService.get_professor_by_id(professor_id)
    return jsonify(result), status_code

@professor_bp.route('/', methods=['POST'])
@jwt_required()
def create_professor():
    current_user = get_jwt_identity()
    # Check for admin access or other permissions
    
    data = request.get_json()
    result, status_code = ProfessorService.create_professor(data)
    return jsonify(result), status_code

@professor_bp.route('/<int:professor_id>', methods=['PUT'])
@jwt_required()
def update_professor(professor_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to update professors
    
    data = request.get_json()
    result, status_code = ProfessorService.update_professor(professor_id, data)
    return jsonify(result), status_code

@professor_bp.route('/<int:professor_id>', methods=['DELETE'])
@jwt_required()
def delete_professor(professor_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to delete professors
    
    result, status_code = ProfessorService.delete_professor(professor_id)
    return jsonify(result), status_code
