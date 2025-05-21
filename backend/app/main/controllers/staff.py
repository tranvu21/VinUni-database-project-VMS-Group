from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from controllers import staff_bp
from services.staff_services import StaffService

@staff_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_staff():
    current_user = get_jwt_identity()
    # Check for appropriate permissions
    
    staff_members = StaffService.get_all_staff()
    return jsonify(staff_members), 200

@staff_bp.route('/<int:staff_id>', methods=['GET'])
@jwt_required()
def get_staff(staff_id):
    result, status_code = StaffService.get_staff_by_id(staff_id)
    return jsonify(result), status_code

@staff_bp.route('/', methods=['POST'])
@jwt_required()
def create_staff():
    current_user = get_jwt_identity()
    # Check for admin access or other permissions
    
    data = request.get_json()
    result, status_code = StaffService.create_staff(data)
    return jsonify(result), status_code

@staff_bp.route('/<int:staff_id>', methods=['PUT'])
@jwt_required()
def update_staff(staff_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to update staff
    
    data = request.get_json()
    result, status_code = StaffService.update_staff(staff_id, data)
    return jsonify(result), status_code

@staff_bp.route('/<int:staff_id>', methods=['DELETE'])
@jwt_required()
def delete_staff(staff_id):
    current_user = get_jwt_identity()
    # Ensure user has permission to delete staff
    
    result, status_code = StaffService.delete_staff(staff_id)
    return jsonify(result), status_code
