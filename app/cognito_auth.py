



"""
AWS Cognito Authentication Decorator
Cognito JWT 토큰을 검증하는 데코레이터입니다.
"""

from functools import wraps
from flask import request, jsonify, current_app
from cognito_config import cognito_config

def cognito_jwt_required(f):
    """Cognito JWT 토큰을 검증하는 데코레이터"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Authorization 헤더에서 토큰 추출
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                "error": "Missing Authorization header",
                "message": "Authorization header is required"
            }), 401
        
        # Bearer 토큰 형식 확인
        if not auth_header.startswith('Bearer '):
            return jsonify({
                "error": "Invalid Authorization header",
                "message": "Authorization header must start with 'Bearer '"
            }), 401
        
        token = auth_header.split(' ')[1]
        
        # 토큰 검증
        payload = cognito_config.verify_token(token)
        if not payload:
            return jsonify({
                "error": "Invalid token",
                "message": "Token verification failed"
            }), 401
        
        # 요청 객체에 사용자 정보 추가
        request.cognito_user = payload
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_cognito_user():
    """현재 요청의 Cognito 사용자 정보를 반환합니다."""
    return getattr(request, 'cognito_user', None)

def get_cognito_user_id():
    """현재 요청의 Cognito 사용자 ID를 반환합니다."""
    user = get_cognito_user()
    return user.get('sub') if user else None


