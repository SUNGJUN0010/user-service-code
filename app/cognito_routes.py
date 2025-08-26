"""
AWS Cognito Routes
Cognito 인증을 위한 API 엔드포인트들입니다.
"""

from flask import Blueprint, request, jsonify, current_app
from cognito_config import cognito_config
from cognito_auth import cognito_jwt_required, get_cognito_user_id
from user.models import db, User
from datetime import datetime

bp = Blueprint("cognito", __name__, url_prefix="/api/v1/cognito")

@bp.post("/register")
def register():
    """Cognito를 통한 사용자 회원가입"""
    try:
        data = request.get_json() or {}
        
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({
                "error": "Missing required fields",
                "message": "Username, email, and password are required"
            }), 400
        
        # Cognito에 사용자 생성
        cognito_response = cognito_config.create_user(
            username=username,
            email=email,
            password=password,
            attributes={
                'email_verified': 'true'
            }
        )
        
        if not cognito_response:
            return jsonify({
                "error": "User creation failed",
                "message": "Failed to create user in Cognito"
            }), 500
        
        # 로컬 데이터베이스에도 사용자 정보 저장 (선택사항)
        try:
            local_user = User(
                username=username,
                email=email,
                cognito_user_id=cognito_response['User']['Username'],
                is_active=True
            )
            db.session.add(local_user)
            db.session.commit()
        except Exception as e:
            current_app.logger.warning(f"Failed to create local user: {e}")
        
        return jsonify({
            "message": "User registered successfully",
            "user": {
                "username": username,
                "email": email,
                "cognito_user_id": cognito_response['User']['Username']
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Cognito registration error: {str(e)}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Registration failed"
        }), 500

@bp.post("/login")
def login():
    """Cognito를 통한 사용자 로그인"""
    try:
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                "error": "Missing credentials",
                "message": "Username and password are required"
            }), 400
        
        # Cognito 인증
        auth_response = cognito_config.authenticate_user(username, password)
        
        if not auth_response:
            return jsonify({
                "error": "Authentication failed",
                "message": "Invalid username or password"
            }), 401
        
        # 인증 성공
        tokens = auth_response['AuthenticationResult']
        
        # 사용자 정보 가져오기
        user_info = cognito_config.get_user_info(tokens['AccessToken'])
        
        return jsonify({
            "message": "Login successful",
            "access_token": tokens['AccessToken'],
            "refresh_token": tokens.get('RefreshToken'),
            "id_token": tokens.get('IdToken'),
            "expires_in": tokens.get('ExpiresIn'),
            "user": {
                "username": username,
                "cognito_user_id": user_info['Username'] if user_info else None
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Cognito login error: {str(e)}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Login failed"
        }), 500

@bp.post("/refresh")
def refresh_token():
    """리프레시 토큰을 사용하여 새로운 액세스 토큰 발급"""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                "error": "Missing refresh token",
                "message": "Refresh token is required"
            }), 400
        
        # 토큰 갱신
        refresh_response = cognito_config.refresh_token(refresh_token)
        
        if not refresh_response:
            return jsonify({
                "error": "Token refresh failed",
                "message": "Invalid refresh token"
            }), 401
        
        tokens = refresh_response['AuthenticationResult']
        
        return jsonify({
            "access_token": tokens['AccessToken'],
            "id_token": tokens.get('IdToken'),
            "expires_in": tokens.get('ExpiresIn')
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Token refresh failed"
        }), 500

@bp.get("/profile")
@cognito_jwt_required
def get_profile():
    """Cognito 사용자 프로필 조회"""
    try:
        user_id = get_cognito_user_id()
        
        # 로컬 데이터베이스에서 사용자 정보 조회
        user = User.query.filter_by(cognito_user_id=user_id).first()
        
        if not user:
            return jsonify({
                "error": "User not found",
                "message": "User not found in local database"
            }), 404
        
        return jsonify({
            "user": user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Profile retrieval error: {str(e)}")
        return jsonify({
            "error": "Internal Server Error",
            "message": "Failed to retrieve profile"
        }), 500

@bp.put("/profile")
@cognito_jwt_required
def update_profile():
    """Cognito 사용자 프로필 업데이트"""
    try:
        user_id = get_cognito_user_id()
        
        # 로컬 데이터베이스에서 사용자 조회
        user = User.query.filter_by(cognito_user_id=user_id).first()
        
        if not user:
            return jsonify({
                "error": "User not found",
                "message": "User not found in local database"
            }), 404
        
        # 파일 업로드 처리
        if 'profileImage' in request.files:
            file = request.files['profileImage']
            if file and file.filename:
                import os
                filename = f"profile_{user_id}.png"
                file_path = os.path.join(current_app.config.get('UPLOAD_FOLDER', 'uploads'), filename)
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                file.save(file_path)
                
                user.profile_image_url = f"/uploads/{filename}"
        
        # JSON 데이터 처리
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
            "error": "Internal Server Error",
            "message": "Failed to update profile"
        }), 500


