"""
User Service Routes
MSA 환경에서 User 서비스의 API 엔드포인트를 정의합니다.
"""

import os
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

from .models import db, User
from .validators import UserValidator
from .services import UserService
from cognito_auth import cognito_jwt_required, get_cognito_user_id

bp = Blueprint("user", __name__, url_prefix="/api/v1/users")

# ==================== 사용자 관리 엔드포인트 ====================

@bp.get("/profile")
@cognito_jwt_required
def get_profile():
    """현재 사용자 프로필 조회"""
    try:
        cognito_user_id = get_cognito_user_id()
        user = User.query.filter_by(cognito_user_id=cognito_user_id).first()
        
        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        return jsonify({
            "user": user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Profile retrieval error: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve profile"
        }), 500

@bp.put("/profile")
@cognito_jwt_required
def update_profile():
    """사용자 프로필 업데이트"""
    try:
        cognito_user_id = get_cognito_user_id()
        user = User.query.filter_by(cognito_user_id=cognito_user_id).first()
        
        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # 파일 업로드 처리
        if 'profileImage' in request.files:
            file = request.files['profileImage']
            if file and file.filename:
                # 파일 저장 로직 (간단한 예시)
                filename = f"profile_{cognito_user_id}.png"
                file_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)
                
                # 사용자 모델에 프로필 이미지 경로 저장
                user.profile_image_url = f"/uploads/{filename}"

        # JSON 데이터 처리 (Content-Type이 application/json인 경우에만)
        data = {}
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json() or {}
        
        # 업데이트 가능한 필드들
        updatable_fields = ['bio', 'first_name', 'last_name', 'phone']
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Profile update error: {str(e)}")
        return jsonify({
            "error": "Failed to update profile"
        }), 500

@bp.get("/<int:user_id>")
def get_user(user_id):
    """특정 사용자 정보 조회 (공개용)"""
    try:
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({
                "error": "User not found"
            }), 404

        return jsonify({
            "user": user.to_public_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"User retrieval error: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve user"
        }), 500

@bp.get("/search")
def search_users():
    """사용자 검색"""
    try:
        query = request.args.get('q', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        if not query:
            return jsonify({
                "error": "Search query is required"
            }), 400

        # 사용자 검색
        users = User.query.filter(
            User.username.ilike(f'%{query}%'),
            User.is_active == True
        ).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )

        return jsonify({
            "users": [user.to_public_dict() for user in users.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": users.total,
                "pages": users.pages
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"User search error: {str(e)}")
        return jsonify({
            "error": "Search failed"
        }), 500

# ==================== 관리자 엔드포인트 ====================

@bp.get("/admin/all")
@cognito_jwt_required
def get_all_users():
    """모든 사용자 조회 (관리자용)"""
    try:
        cognito_user_id = get_cognito_user_id()
        current_user = User.query.filter_by(cognito_user_id=cognito_user_id).first()
        
        if not current_user or not current_user.is_verified:
            return jsonify({
                "error": "Unauthorized"
            }), 403

        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        users = User.query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )

        return jsonify({
            "users": [user.to_dict() for user in users.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": users.total,
                "pages": users.pages
            }
        }), 200

    except Exception as e:
        current_app.logger.error(f"Admin user retrieval error: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve users"
        }), 500

@bp.put("/admin/<int:user_id>/status")
@cognito_jwt_required
def update_user_status(user_id):
    """사용자 상태 업데이트 (관리자용)"""
    try:
        cognito_user_id = get_cognito_user_id()
        current_user = User.query.filter_by(cognito_user_id=cognito_user_id).first()
        
        if not current_user or not current_user.is_verified:
            return jsonify({
                "error": "Unauthorized"
            }), 403

        target_user = User.query.get(user_id)
        if not target_user:
            return jsonify({
                "error": "User not found"
            }), 404

        data = request.get_json() or {}
        is_active = data.get('is_active')
        
        if is_active is not None:
            target_user.is_active = is_active
            target_user.updated_at = datetime.utcnow()
            db.session.commit()

        return jsonify({
            "message": "User status updated successfully",
            "user": target_user.to_dict()
        }), 200

    except Exception as e:
        current_app.logger.error(f"User status update error: {str(e)}")
        return jsonify({
            "error": "Failed to update user status"
        }), 500
