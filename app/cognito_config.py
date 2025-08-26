
"""
AWS Cognito Configuration
AWS Cognito와 연동하기 위한 설정 파일입니다.
"""

import os
import boto3
from botocore.exceptions import ClientError
from jose import jwt
import requests
import json

class CognitoConfig:
    def __init__(self):
        # AWS Cognito 설정 (환경변수에서 가져오기)
        self.region = os.getenv('AWS_REGION', 'us-east-1')
        self.user_pool_id = os.getenv('COGNITO_USER_POOL_ID')
        self.client_id = os.getenv('COGNITO_CLIENT_ID')
        self.client_secret = os.getenv('COGNITO_CLIENT_SECRET', None)
        
        # Cognito 클라이언트 초기화
        self.cognito_client = boto3.client('cognito-idp', region_name=self.region)
        
        # JWT 토큰 검증을 위한 공개키 가져오기
        self.public_keys = self._get_public_keys()
    
    def _get_public_keys(self):
        """Cognito User Pool의 공개키들을 가져옵니다."""
        try:
            # Cognito 설정이 없으면 빈 딕셔너리 반환
            if not self.user_pool_id:
                print("Cognito User Pool ID not configured. Skipping public keys fetch.")
                return {}
                
            url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
            response = requests.get(url)
            response.raise_for_status()
            jwks = response.json()
            
            public_keys = {}
            for key in jwks['keys']:
                kid = key['kid']
                public_keys[kid] = key
            
            return public_keys
        except Exception as e:
            print(f"Error fetching public keys: {e}")
            return {}
    
    def verify_token(self, token):
        """JWT 토큰을 검증합니다."""
        try:
            # 토큰 헤더에서 kid (Key ID) 추출
            header = jwt.get_unverified_header(token)
            kid = header['kid']
            
            if kid not in self.public_keys:
                raise Exception("Invalid token: Key ID not found")
            
            # 토큰 검증
            payload = jwt.decode(
                token,
                self.public_keys[kid],
                algorithms=['RS256'],
                audience=self.client_id,
                issuer=f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}"
            )
            
            return payload
        except Exception as e:
            print(f"Token verification failed: {e}")
            return None
    
    def get_user_info(self, access_token):
        """액세스 토큰을 사용하여 사용자 정보를 가져옵니다."""
        try:
            response = self.cognito_client.get_user(
                AccessToken=access_token
            )
            return response
        except ClientError as e:
            print(f"Error getting user info: {e}")
            return None
    
    def create_user(self, username, email, password, attributes=None):
        """Cognito에 새 사용자를 생성합니다."""
        try:
            user_attributes = [
                {
                    'Name': 'email',
                    'Value': email
                }
            ]
            
            if attributes:
                for key, value in attributes.items():
                    user_attributes.append({
                        'Name': key,
                        'Value': str(value)
                    })
            
            response = self.cognito_client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=username,
                UserAttributes=user_attributes,
                TemporaryPassword=password,
                MessageAction='SUPPRESS'  # 환영 이메일 발송 안함
            )
            
            return response
        except ClientError as e:
            print(f"Error creating user: {e}")
            return None
    
    def authenticate_user(self, username, password):
        """사용자 인증을 수행합니다."""
        try:
            auth_parameters = {
                'USERNAME': username,
                'PASSWORD': password
            }
            
            if self.client_secret:
                auth_parameters['SECRET_HASH'] = self._calculate_secret_hash(username)
            
            response = self.cognito_client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters=auth_parameters
            )
            
            return response
        except ClientError as e:
            print(f"Authentication error: {e}")
            return None
    
    def _calculate_secret_hash(self, username):
        """SECRET_HASH를 계산합니다 (Client Secret이 있는 경우)."""
        import hashlib
        import hmac
        import base64
        
        message = username + self.client_id
        dig = hmac.new(
            str(self.client_secret).encode('utf-8'),
            msg=str(message).encode('utf-8'),
            digestmod=hashlib.sha256
        ).digest()
        
        return base64.b64encode(dig).decode()
    
    def refresh_token(self, refresh_token):
        """리프레시 토큰을 사용하여 새로운 액세스 토큰을 가져옵니다."""
        try:
            auth_parameters = {
                'REFRESH_TOKEN': refresh_token
            }
            
            if self.client_secret:
                auth_parameters['SECRET_HASH'] = self._calculate_secret_hash('')
            
            response = self.cognito_client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters=auth_parameters
            )
            
            return response
        except ClientError as e:
            print(f"Token refresh error: {e}")
            return None

# 전역 Cognito 설정 인스턴스
cognito_config = CognitoConfig()


