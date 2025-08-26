"""
User Service Models
MSA 환경에서 User 서비스의 데이터 모델을 정의합니다.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    """사용자 모델"""
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    cognito_user_id = db.Column(db.String(128), unique=True, nullable=True, index=True)  # Cognito User ID
    bio = db.Column(db.String(255))
    avatar_url = db.Column(db.String(255))
    profile_image_url = db.Column(db.String(255))  # 프로필 이미지 URL 필드 추가
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
    # 프로필 정보
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    
    # 로그인 관련
    last_login_at = db.Column(db.DateTime)
    
    # 타임스탬프
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        """사용자 정보를 딕셔너리로 변환"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "profile_image_url": self.profile_image_url,  # 프로필 이미지 URL 추가
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_public_dict(self):
        """공개용 사용자 정보 (민감한 정보 제외)"""
        return {
            "id": self.id,
            "username": self.username,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

def init_users():
    """초기 사용자 데이터 생성 (개발용)"""
    
    # 기본 관리자 계정 생성 (Cognito 기반)
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@example.com',
            cognito_user_id='admin-cognito-id',  # Cognito에서 생성된 ID
            is_active=True,
            is_verified=True,
            bio='System Administrator'
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created")
