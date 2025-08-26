import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FindPasswordPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

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
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '비밀번호 찾기에 실패했습니다.');
      }
    } catch (error) {
      console.error('비밀번호 찾기 오류:', error);
      alert('비밀번호 찾기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="findpassword-page">
      <div className="findpassword-container">
        <h1 className="findpassword-title">비밀번호 찾기</h1>
        
        <form className="findpassword-form" onSubmit={handleSubmit}>
          <div className="findpassword-form-group">
            <label className="findpassword-input-label">ID</label>
            <input
              type="text"
              name="username"
              placeholder="아이디"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="findpassword-form-group">
            <label className="findpassword-input-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button
            type="submit"
            className="findpassword-submit-btn"
            disabled={loading}
          >
            {loading ? '처리 중...' : '비밀번호 찾기'}
          </button>
        </form>

        <div className="findpassword-links">
          <Link to="/login" className="findpassword-link">로그인으로 돌아가기</Link>
        </div>
      </div>

      <style jsx>{`
        .findpassword-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--color-default-bg);
          padding: 24px;
        }

        .findpassword-container {
          background-color: var(--color-white);
          padding: 80px 120px;
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .findpassword-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-title);
          margin-bottom: 36px;
        }

        .findpassword-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .findpassword-form-group {
          width: 90%;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          background-color: var(--color-white-shadow);
          border-radius: 9999px;
          padding: 2px 16px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .findpassword-input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-subtitle);
          min-width: 40px;
        }

        .findpassword-form-group input {
          flex-grow: 1;
          width: 100%;
          padding: 12px 20px;
          margin: 2px 12px;
          border: none;
          border-radius: 9999px;
          font-size: 16px;
          color: var(--color-text-default);
          background-color: #f1f2f4;
          transition: background-color 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .findpassword-form-group input:focus {
          background-color: var(--color-white);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          outline: none;
        }

        .findpassword-form-group input::placeholder {
          color: var(--color-placeholder-grey);
          font-size: 14px;
        }

        .findpassword-submit-btn {
          width: 120px;
          margin-top: 24px;
          padding: 1rem;
          background-color: var(--color-dark-navy);
          color: var(--color-white);
          font-size: 1.125rem;
          font-weight: 600;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: background-color 0.2s, transform 0.2s;
        }

        .findpassword-submit-btn:hover:not(:disabled) {
          background-color: var(--color-darker-navy);
          transform: translateY(-2px);
        }

        .findpassword-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .findpassword-links {
          margin-top: 24px;
        }

        .findpassword-link {
          color: var(--color-subtitle);
          text-decoration: none;
          transition: color 0.2s;
        }

        .findpassword-link:hover {
          color: var(--color-title);
        }
      `}</style>
    </div>
  );
};

export default FindPasswordPage;
