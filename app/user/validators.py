
"""
User Service Validators
MSA 환경에서 User 서비스의 입력 데이터 검증을 담당합니다.
"""

import re

class UserValidator:
    """사용자 데이터 검증 클래스"""
    
    def __init__(self):
        # 전화번호 정규식: 한국 전화번호 형식
        self.phone_pattern = re.compile(r'^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$')
    
    def validate_profile_update(self, data):
        """프로필 업데이트 데이터 검증"""
        errors = []
        
        # 업데이트 가능한 필드들
        updatable_fields = ['bio', 'first_name', 'last_name', 'phone']
        
        for field in updatable_fields:
            if field in data:
                value = data[field]
                
                if field in ['first_name', 'last_name']:
                    if value and len(value.strip()) > 50:
                        errors.append(f"{field} must be 50 characters or less")
                
                elif field == 'phone':
                    if value and not self.phone_pattern.match(value.strip()):
                        errors.append("Invalid phone number format (e.g., 010-1234-5678)")
                
                elif field == 'bio':
                    if value and len(value.strip()) > 255:
                        errors.append("Bio must be 255 characters or less")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }
