from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers import student_bp
from services.student_services import StudentService

@student_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_students():
    current_user = get_jwt_identity()
    # Check for admin access or other permissions as needed
    
    students = StudentService.get_all_students()
    return jsonify(students), 200

@student_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    result, status_code = StudentService.get_student_by_id(student_id)
    return jsonify(result), status_code

@student_bp.route('/', methods=['POST'])
@jwt_required()
def create_student():
    current_user = get_jwt_identity()
    # Check for admin access or other permissions
    
    data = request.get_json()
    result, status_code = StudentService.create_student(data)
    return jsonify(result), status_code

@student_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to update this student
    
    data = request.get_json()
    result, status_code = StudentService.update_student(student_id, data)
    return jsonify(result), status_code

@student_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_student(student_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to delete students
    
    result, status_code = StudentService.delete_student(student_id)
    return jsonify(result), status_code
