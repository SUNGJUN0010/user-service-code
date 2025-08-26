"""
User Service Business Logic
MSA 환경에서 User 서비스의 비즈니스 로직을 담당합니다.
"""

from datetime import datetime
from flask import current_app
from sqlalchemy.exc import IntegrityError

from .models import db, User

class UserService:
    """사용자 서비스 클래스"""
    
    def get_user_by_id(self, user_id):
        """ID로 사용자 조회"""
        return User.query.get(user_id)
    
    def get_user_by_username(self, username):
        """사용자명으로 사용자 조회"""
        return User.query.filter_by(username=username).first()
    
    def get_user_by_email(self, email):
        """이메일로 사용자 조회"""
        return User.query.filter_by(email=email).first()
    
    def get_user_by_cognito_id(self, cognito_user_id):
        """Cognito User ID로 사용자 조회"""
        return User.query.filter_by(cognito_user_id=cognito_user_id).first()
    
    def create_user_from_cognito(self, username, email, cognito_user_id, **kwargs):
        """Cognito에서 생성된 사용자를 로컬 DB에 저장"""
        try:
            # 사용자명과 이메일 중복 확인
            if User.query.filter_by(username=username).first():
                raise ValueError("Username already exists")
            
            if User.query.filter_by(email=email).first():
                raise ValueError("Email already exists")
            
            # 새 사용자 생성 (비밀번호 없이)
            user = User(
                username=username,
                email=email,
                cognito_user_id=cognito_user_id,
                is_active=True,
                is_verified=True,  # Cognito에서 생성된 사용자는 인증된 것으로 간주
                **kwargs
            )
            
            db.session.add(user)
            db.session.commit()
            
            return user
            
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Database constraint violation")
        except Exception as e:
            db.session.rollback()
            raise e
    
    def update_user_profile(self, user_id, **kwargs):
        """사용자 프로필 업데이트"""
        try:
            user = User.query.get(user_id)
            if not user:
                raise ValueError("User not found")
            
            # 업데이트 가능한 필드들
            updatable_fields = [
                'bio', 'first_name', 'last_name', 'phone', 
                'avatar_url'
            ]
            
            for field in updatable_fields:
                if field in kwargs:
                    setattr(user, field, kwargs[field])
            
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return user
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    def search_users(self, query, page=1, per_page=20):
        """사용자 검색"""
        try:
            users = User.query.filter(
                User.username.ilike(f'%{query}%'),
                User.is_active == True
            ).paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )
            
            return users
            
        except Exception as e:
            current_app.logger.error(f"User search error: {str(e)}")
            raise e
    
    def get_all_users(self, page=1, per_page=50):
        """모든 사용자 조회 (관리자용)"""
        try:
            users = User.query.paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )
            
            return users
            
        except Exception as e:
            current_app.logger.error(f"Get all users error: {str(e)}")
            raise e
