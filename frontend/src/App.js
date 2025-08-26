import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Cognito 로그인 페이지
function CognitoLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log('로그인 성공:', { isSignedIn, nextStep });
      
      if (isSignedIn) {
        // JWT 토큰을 로컬 스토리지에 저장
        const session = await fetchAuthSession();
        const accessToken = session.tokens.accessToken.toString();
        localStorage.setItem('authToken', accessToken);
        
        alert('로그인 성공!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert(`로그인 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h2>AWS Cognito 로그인</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="사용자명"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>홈으로 돌아가기</Link>
      </div>
    </div>
  );
}

// Cognito 회원가입 페이지
function CognitoSignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.email || !formData.name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            name: formData.name
          },
          // Client Secret이 있는 경우를 위한 설정
          clientMetadata: {
            // 필요한 경우 여기에 추가 메타데이터
          }
        }
      });
      
      console.log('회원가입 성공:', { isSignUpComplete, userId, nextStep });
      alert('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.');
      navigate('/cognito-login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert(`회원가입 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h2>AWS Cognito 회원가입</h2>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="username"
            placeholder="사용자명"
            value={formData.username}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder="이름"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>홈으로 돌아가기</Link>
      </div>
    </div>
  );
}

// Cognito 대시보드 페이지
function CognitoDashboardPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        const session = await fetchAuthSession();
        const attributes = session.tokens.accessToken.payload;
        setUserInfo({
          username: user.username,
          email: attributes.email,
          name: attributes.name,
          emailVerified: attributes.email_verified
        });
      } catch (error) {
        console.error('인증 확인 오류:', error);
        navigate('/cognito-login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('authToken');
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 AWS Cognito 환영합니다!</h1>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
        <h2>사용자 정보</h2>
        <p><strong>사용자명:</strong> {userInfo?.username || 'N/A'}</p>
        <p><strong>이름:</strong> {userInfo?.name || 'N/A'}</p>
        <p><strong>이메일:</strong> {userInfo?.email || 'N/A'}</p>
        <p><strong>이메일 인증:</strong> {userInfo?.emailVerified ? '✅ 인증됨' : '❌ 미인증'}</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={handleLogout}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

// 홈 페이지
function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 AWS Cognito User Service</h1>
      <p>AWS Cognito를 사용한 사용자 인증 시스템입니다!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>현재 상태:</h2>
        <ul>
          <li>✅ React 앱 로드됨</li>
          <li>✅ AWS Cognito 연동됨</li>
          <li>✅ 라우팅 시스템 활성화</li>
          <li>✅ Amplify 설정 완료</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p><strong>사용 가능한 기능:</strong></p>
        <ul>
          <li>🔐 AWS Cognito 회원가입</li>
          <li>🔑 AWS Cognito 로그인</li>
          <li>👤 사용자 정보 조회</li>
          <li>🚪 안전한 로그아웃</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <Link to="/cognito-login" style={{ marginRight: '10px', padding: '10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Cognito 로그인
        </Link>
        <Link to="/cognito-signup" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Cognito 회원가입
        </Link>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <Router>
      <div>
        <nav style={{ backgroundColor: '#f8f9fa', padding: '10px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>
            ☁️ AWS Cognito User Service
          </Link>
          <div>
            {isLoggedIn ? (
              <Link to="/dashboard" style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}>
                대시보드
              </Link>
            ) : (
              <>
                <Link to="/cognito-login" style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}>
                  Cognito 로그인
                </Link>
                <Link to="/cognito-signup" style={{ color: '#28a745', textDecoration: 'none' }}>
                  Cognito 회원가입
                </Link>
              </>
            )}
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cognito-login" element={<CognitoLoginPage />} />
          <Route path="/cognito-signup" element={<CognitoSignupPage />} />
          <Route path="/dashboard" element={<CognitoDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
