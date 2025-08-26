import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Import new components
import MainBoardPage from './pages/MainBoardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import MyPage from './pages/MyPage';
import FindIdentificationPage from './pages/FindIdentificationPage';
import FindPasswordPage from './pages/FindPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Cognito 로그인 페이지 (기존)
function CognitoLoginPage({ onLoginSuccess }) {
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
        
        // 현재 사용자 정보 가져오기
        const currentUser = await getCurrentUser();
        const userData = {
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || '',
          id: currentUser.userId
        };
        
        // 부모 컴포넌트에 로그인 성공 알림
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
        
        alert('로그인 성공!');
        navigate('/');
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

// Cognito 회원가입 페이지 (기존)
function CognitoSignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.email) {
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
          },
        },
      });

      if (isSignUpComplete) {
        alert('회원가입이 완료되었습니다!');
        navigate('/cognito-login');
      } else {
        console.log('회원가입 다음 단계:', nextStep);
        alert('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        navigate('/cognito-login');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert(`회원가입 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleInputChange}
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
        <Link to="/cognito-login" style={{ color: '#007bff', textDecoration: 'none' }}>로그인으로 돌아가기</Link>
      </div>
    </div>
  );
}

// 대시보드 페이지 (기존)
function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        navigate('/cognito-login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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
    return <div>로딩 중...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>대시보드</h1>
      <p>환영합니다, {user?.username}님!</p>
      <button 
        onClick={handleLogout}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}
      >
        로그아웃
      </button>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>홈으로 돌아가기</Link>
      </div>
    </div>
  );
}

// 메인 App 컴포넌트
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Cognito 인증 상태 확인
    checkCognitoAuthState();
  }, []);

  const checkCognitoAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setCurrentUser({
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || '',
          id: currentUser.userId
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log('사용자가 로그인되지 않았습니다:', error);
      setIsLoggedIn(false);
      setCurrentUser(null);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Cognito에서 현재 사용자 정보 가져오기
        const currentUser = await getCurrentUser();
        setCurrentUser({
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || '',
          id: currentUser.userId
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        handleLogout();
      }
    }
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    alert('성공적으로 로그인 되었습니다!');
  };

  const handleLogout = async () => {
    try {
      // Cognito 로그아웃만 사용
      await signOut();
      
      // 로컬 상태 정리
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
      setCurrentUser(null);
      setProfileImage(null);
      
      alert('로그아웃 되었습니다.');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      // Cognito 로그아웃이 실패해도 로컬 상태는 정리
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
      setCurrentUser(null);
      setProfileImage(null);
      alert('로그아웃 되었습니다.');
    }
  };

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <Router>
      <Routes>
        {/* 메인 보드 페이지 (먹구름 스타일) */}
        <Route
          path="/"
          element={
            <MainBoardPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              profileImage={profileImage}
              posts={posts}
              setPosts={setPosts}
              currentUser={currentUser}
            />
          }
        />
        
        {/* 새로운 페이지들 */}
        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={<SignUpPage />}
        />
        <Route
          path="/mypage"
          element={
            <MyPage
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/findid" element={<FindIdentificationPage />} />
        <Route path="/findpassword" element={<FindPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* 기존 Cognito 페이지들 */}
        <Route path="/cognito-login" element={<CognitoLoginPage onLoginSuccess={handleLogin} />} />
        <Route path="/cognito-signup" element={<CognitoSignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
