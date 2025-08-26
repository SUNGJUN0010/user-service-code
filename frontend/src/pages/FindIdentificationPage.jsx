import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FindIdentificationPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 백엔드 API 호출
      const response = await fetch('/api/v1/auth/find-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('아이디가 이메일로 전송되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.message || '아이디 찾기에 실패했습니다.');
      }
    } catch (error) {
      console.error('아이디 찾기 오류:', error);
      alert('아이디 찾기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="findid-page">
      <div className="findid-container">
        <h1 className="findid-title">아이디 찾기</h1>
        
        <form className="findid-form" onSubmit={handleSubmit}>
          <div className="findid-form-group">
            <label className="findid-input-label">Email</label>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="findid-submit-btn"
            disabled={loading}
          >
            {loading ? '처리 중...' : '아이디 찾기'}
          </button>
        </form>

        <div className="findid-links">
          <Link to="/login" className="findid-link">로그인으로 돌아가기</Link>
        </div>
      </div>

      <style jsx>{`
        .findid-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: var(--color-default-bg);
          padding: 24px;
        }

        .findid-container {
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

        .findid-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-title);
          margin-bottom: 36px;
        }

        .findid-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .findid-form-group {
          width: 90%;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          background-color: var(--color-white-shadow);
          border-radius: 9999px;
          padding: 2px 16px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }

        .findid-input-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-subtitle);
          min-width: 40px;
        }

        .findid-form-group input {
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

        .findid-form-group input:focus {
          background-color: var(--color-white);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          outline: none;
        }

        .findid-form-group input::placeholder {
          color: var(--color-placeholder-grey);
          font-size: 14px;
        }

        .findid-submit-btn {
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

        .findid-submit-btn:hover:not(:disabled) {
          background-color: var(--color-darker-navy);
          transform: translateY(-2px);
        }

        .findid-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .findid-links {
          margin-top: 24px;
        }

        .findid-link {
          color: var(--color-subtitle);
          text-decoration: none;
          transition: color 0.2s;
        }

        .findid-link:hover {
          color: var(--color-title);
        }
      `}</style>
    </div>
  );
};

export default FindIdentificationPage;
