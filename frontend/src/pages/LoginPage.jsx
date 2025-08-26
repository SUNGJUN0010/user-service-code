import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 백엔드 API 호출
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.access_token);
        onLogin(data.user);
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">로그인</h1>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="text-form">
            <label className="input-label">ID</label>
            <input
              type="text"
              name="username"
              placeholder="아이디"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="text-form">
            <label className="input-label">PWD</label>
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="login-links">
            <Link to="/signup" className="login-link">회원가입</Link>
            <Link to="/findid" className="login-link">아이디 찾기</Link>
            <Link to="/findpassword" className="login-link">비밀번호 찾기</Link>
          </div>
          
          <button
            type="submit"
            className="login-login-btn"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--color-default-bg);
          padding: 24px;
        }

        .login-container {
          background-color: var(--color-white);
          padding: 80px 120px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-title);
          margin-bottom: 36px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .text-form {
          width: 90%;
          display: flex;
          align-items: center;
          background-color: var(--color-darker-bg);
          border-radius: 9999px;
          padding: 2px 16px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-white);
          min-width: 40px;
        }

        .form-input {
          flex-grow: 1;
          width: 100%;
          padding: 12px 20px;
          margin: 2px 12px;
          border: none;
          border-radius: 9999px;
          font-size: 16px;
          color: var(--color-text-default);
          background-color: var(--color-darker-bg);
          transition: background-color 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-input:focus {
          outline: none;
          background-color: var(--color-default-bg);
        }

        .form-input::placeholder {
          color: var(--color-placeholder-white);
          font-size: 14px;
        }

        .login-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin: 24px 0px;
          font-size: 14px;
        }

        .login-link {
          color: var(--color-subtitle);
          text-decoration: none;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: var(--color-title);
        }

        .login-login-btn {
          width: 120px;
          margin-top: 12px;
          padding: 14px;
          border: none;
          border-radius: 9999px;
          background-color: var(--color-dark-navy);
          color: var(--color-white);
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: background-color 0.2s, transform 0.2s;
        }

        .login-login-btn:hover:not(:disabled) {
          background-color: var(--color-darker-navy);
          transform: translateY(-2px);
        }

        .login-login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
