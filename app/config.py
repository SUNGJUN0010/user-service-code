"""
User Service Configuration
MSA 환경에서 User 서비스의 설정을 관리합니다.
"""

import os

class Config:
    # 보안 키 (운영 환경에서는 반드시 환경 변수로 설정)
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 데이터베이스 연결 (SQLite 사용)
    DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'sqlite')
    
    if DATABASE_TYPE == 'sqlite':
        # SQLite: 현재 디렉토리의 data 폴더에 저장
        db_path = os.path.join(os.path.dirname(__file__), 'data', 'user_service.db')
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{db_path}'
    elif DATABASE_TYPE == 'mysql':
        # MySQL: 환경 변수로 설정
        MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
        MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
        MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
        MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
        MYSQL_DATABASE = os.environ.get('MYSQL_DATABASE', 'user_service')
        
        SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}'
    elif DATABASE_TYPE == 'postgresql':
        # PostgreSQL: 환경 변수로 설정
        POSTGRES_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
        POSTGRES_PORT = os.environ.get('POSTGRES_PORT', '5432')
        POSTGRES_USER = os.environ.get('POSTGRES_USER', 'postgres')
        POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD', '')
        POSTGRES_DATABASE = os.environ.get('POSTGRES_DATABASE', 'user_service')
        
        SQLALCHEMY_DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DATABASE}'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 환경 설정
    ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
    
    # CORS 설정 (프론트엔드 연동용)
    CORS_ALLOW_ORIGINS = os.environ.get('CORS_ALLOW_ORIGINS', 'http://localhost:3000,http://localhost:8080,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:8080,http://127.0.0.1:5173').split(',')
    
    # 로깅 설정
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', '/app/logs/user_service.log')
    
    # 서버 설정
    HOST = os.environ.get('HOST', '0.0.0.0')
    PORT = int(os.environ.get('PORT', 8081))

class TestConfig(Config):
    """테스트용 설정"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

class DevelopmentConfig(Config):
    """개발 환경 설정"""
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    """운영 환경 설정"""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    # 운영 환경에서는 반드시 환경 변수로 설정
    SECRET_KEY = os.environ.get('SECRET_KEY')
