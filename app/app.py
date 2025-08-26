
"""
User Service - Flask Application
MSA 아키텍처에서 User 서비스를 담당하는 Flask 애플리케이션입니다.
"""

import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from werkzeug.exceptions import HTTPException, NotFound
from flask_migrate import Migrate
from dotenv import load_dotenv

from user.models import db
from user.routes import bp
from cognito_routes import bp as cognito_bp

# .env 파일 로드 (파일이 없어도 오류 발생하지 않음)
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    print("Continuing with default configuration...")

def setup_logging(app):
    """로깅 설정"""
    # Windows 환경을 고려한 로그 디렉토리 설정
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    
    # 파일 핸들러 설정
    log_file = os.path.join(log_dir, 'user_service.log')
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    
    # 콘솔 핸들러 설정
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s'
    ))
    
    # 루트 로거 설정
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.INFO)
    
    app.logger.info('User Service startup')

def create_app(config_class=None):
    """Flask 애플리케이션 팩토리"""
    app = Flask(__name__)
    
    # 설정 로드
    if config_class:
        app.config.from_object(config_class)
    else:
        # 기본 설정 (config.py의 Config 클래스 사용)
        from config import Config
        app.config.from_object(Config)

    # 로깅 설정
    setup_logging(app)
    
    # CORS 설정 (프론트엔드 연동용)
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ALLOW_ORIGINS', ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173']),
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True
        }
    })

    # 데이터베이스 초기화
    db.init_app(app)
    Migrate(app, db)
    
    # 데이터베이스 테이블 생성 및 초기 사용자 생성
    with app.app_context():
        try:
            db.create_all()
            app.logger.info('Database tables created successfully')
            
            # 초기 사용자 생성 시도
            try:
                from user.models import init_users
                init_users()
                app.logger.info('Initial users created successfully')
            except Exception as user_error:
                app.logger.warning(f'Failed to create initial users: {str(user_error)}')
                
        except Exception as e:
            app.logger.error(f'Database initialization failed: {str(e)}')
            # 데이터베이스 오류가 있어도 애플리케이션은 계속 실행
            app.logger.warning('Continuing without database initialization')

    # Swagger UI 설정
    SWAGGER_URL = '/api/docs'
    API_URL = '/static/swagger.json'
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "User Service API"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    # 블루프린트 등록
    app.register_blueprint(bp, url_prefix='/api/v1')
    app.register_blueprint(cognito_bp)  # Cognito 라우트 등록

    # 전역 에러 핸들러
    @app.errorhandler(HTTPException)
    def handle_exception(e):
        """HTTP 예외 처리"""
        app.logger.warning(f'HTTP Exception: {e.code} - {e.name}')
        response = {
            "error": {
                "code": e.code,
                "name": e.name,
                "description": e.description
            }
        }
        return jsonify(response), e.code

    @app.errorhandler(NotFound)
    def handle_not_found(e):
        """404 Not Found 예외 처리"""
        app.logger.warning(f'Not Found: {request.url}')
        response = {
            "error": {
                "code": 404,
                "name": "Not Found",
                "description": "The requested resource was not found"
            }
        }
        return jsonify(response), 404

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        """일반 예외 처리"""
        app.logger.error(f'Unhandled exception: {str(e)}')
        response = {
            "error": {
                "code": 500,
                "name": "Internal Server Error",
                "description": "An unexpected error occurred"
            }
        }
        return jsonify(response), 500

    # 헬스체크 엔드포인트
    @app.route('/health', methods=['GET'])
    def health():
        """서비스 상태 확인"""
        return jsonify({
            'status': 'healthy',
            'service': 'User Service API',
            'version': '1.0.0',
            'environment': app.config.get('ENVIRONMENT', 'development'),
            'database': app.config.get('DATABASE_TYPE', 'sqlite')
        })

    # 루트 엔드포인트
    @app.route('/', methods=['GET'])
    def root():
        """루트 엔드포인트"""
        response = jsonify({
            'service': 'User Service API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'docs': '/api/docs',
                'api': '/api/v1'
            },
            'cors_enabled': True,
            'allowed_origins': app.config.get('CORS_ALLOW_ORIGINS', [])
        })
        return response

    app.logger.info('User Service application created successfully')
    return app

app = create_app()

if __name__ == '__main__':
    # 환경 변수에서 호스트와 포트 가져오기
    host = app.config.get('HOST', '0.0.0.0')
    port = app.config.get('PORT', 8081)
    
    app.logger.info(f'Starting User Service on {host}:{port}')
    app.run(debug=app.config.get('DEBUG', False), host=host, port=port)
