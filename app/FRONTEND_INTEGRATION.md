# 프론트엔드 연동 가이드

## User Service API와 프론트엔드 연동 방법

### 1. 기본 정보
- **API Base URL**: `http://localhost:8081`
- **API Version**: `/api/v1`
- **Documentation**: `http://localhost:8081/api/docs`

### 2. CORS 설정
현재 허용된 Origin:
- `http://localhost:3000` (React 기본 포트)
- `http://localhost:8080` (Vue.js 기본 포트)
- `http://localhost:5173` (Vite 기본 포트)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:8080`
- `http://127.0.0.1:5173`

### 3. 주요 API 엔드포인트

#### 인증 관련
```
POST /api/v1/auth/register     # 회원가입
POST /api/v1/auth/login        # 로그인
POST /api/v1/auth/refresh      # 토큰 갱신
POST /api/v1/auth/logout       # 로그아웃
```

#### 사용자 관리
```
GET    /api/v1/users           # 사용자 목록
GET    /api/v1/users/{id}      # 사용자 상세
PUT    /api/v1/users/{id}      # 사용자 정보 수정
DELETE /api/v1/users/{id}      # 사용자 삭제
```

#### 프로필 관리
```
GET    /api/v1/users/{id}/profile  # 프로필 조회
PUT    /api/v1/users/{id}/profile  # 프로필 수정
```

### 4. 프론트엔드 예제 코드

#### JavaScript/TypeScript (Fetch API)
```javascript
// 기본 설정
const API_BASE_URL = 'http://localhost:8081/api/v1';

// 로그인 예제
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // 쿠키 포함
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// 인증 헤더가 필요한 요청
async function getUserProfile(userId, token) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Profile fetch error:', error);
        throw error;
    }
}
```

#### React Hook 예제
```javascript
import { useState, useEffect } from 'react';

const useUserService = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:8081/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error?.description || 'Login failed');
            }
            
            setUser(data.user);
            localStorage.setItem('token', data.access_token);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return { user, loading, error, login, logout };
};
```

#### Axios 설정 예제
```javascript
import axios from 'axios';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:8081/api/v1',
    withCredentials: true, // 쿠키 포함
    timeout: 10000,
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (토큰 만료 처리)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 로그아웃 처리
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 5. 환경 변수 설정

#### React (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:8081/api/v1
REACT_APP_API_DOCS_URL=http://localhost:8081/api/docs
```

#### Vue.js (.env)
```env
VITE_API_BASE_URL=http://localhost:8081/api/v1
VITE_API_DOCS_URL=http://localhost:8081/api/docs
```

### 6. 테스트 방법

1. **서버 상태 확인**:
   ```bash
   curl http://localhost:8081/health
   ```

2. **API 문서 확인**:
   브라우저에서 `http://localhost:8081/api/docs` 접속

3. **CORS 테스트**:
   ```javascript
   fetch('http://localhost:8081/api/v1/users', {
       method: 'GET',
       credentials: 'include'
   }).then(response => response.json())
     .then(data => console.log(data));
   ```

### 7. 문제 해결

#### CORS 오류 발생 시
1. 프론트엔드 URL이 허용된 Origin에 포함되어 있는지 확인
2. 환경 변수 `CORS_ALLOW_ORIGINS`에 프론트엔드 URL 추가
3. 서버 재시작

#### 인증 오류 발생 시
1. 토큰이 올바르게 전송되는지 확인
2. 토큰 만료 여부 확인
3. Authorization 헤더 형식 확인

### 8. 개발 팁

- 개발 중에는 브라우저 개발자 도구의 Network 탭을 활용하여 요청/응답 확인
- API 문서를 참고하여 올바른 요청 형식 사용
- 에러 응답의 구조를 파악하여 적절한 에러 처리 구현


