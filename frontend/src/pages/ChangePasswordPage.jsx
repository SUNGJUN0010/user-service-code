import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'aws-amplify/auth';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    // 입력 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 복잡성 검증 (Cognito 요구사항)
    // 최소 6자, 소문자, 숫자, 특수문자 포함 (대문자는 선택사항)
    const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('비밀번호는 최소 6자 이상이며, 소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    setIsChanging(true);

    try {
      await updatePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/mypage');
      
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      
      if (error.name === 'NotAuthorizedException') {
        setError('현재 비밀번호가 올바르지 않습니다.');
      } else if (error.name === 'LimitExceededException') {
        setError('비밀번호 변경 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.name === 'InvalidPasswordException') {
        setError('새 비밀번호가 Cognito 정책에 맞지 않습니다.');
      } else {
        setError('비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="change-password-container">
      {/* 헤더 네비게이션 */}
      <div className="header-navigation">
        <button 
          onClick={() => navigate('/')} 
          className="home-btn"
        >
          🏠 메인페이지로
        </button>
      </div>
      
      <div className="change-password-content">
        <h2>비밀번호 변경</h2>
        
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="password-requirements">
            <h4>비밀번호 요구사항:</h4>
            <ul>
              <li>최소 6자 이상</li>
              <li>소문자 포함</li>
              <li>숫자 포함</li>
              <li>특수문자 포함 (@$!%*?&)</li>
            </ul>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate('/mypage')}
              className="cancel-btn"
              disabled={isChanging}
            >
              취소
            </button>
            <button
              type="submit"
              className="change-btn"
              disabled={isChanging}
            >
              {isChanging ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .change-password-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 24px;
          position: relative;
        }

        .header-navigation {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .home-btn {
          padding: 10px 16px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .home-btn:hover {
          background-color: #5855eb;
        }

        .change-password-content {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 500px;
          width: 100%;
        }

        .change-password-content h2 {
          color: #1f2937;
          margin-bottom: 32px;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #1f2937;
          font-weight: 500;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #fecaca;
          font-size: 14px;
        }

        .password-requirements {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .password-requirements h4 {
          color: #1f2937;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .password-requirements ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
          font-size: 14px;
        }

        .password-requirements li {
          margin-bottom: 4px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .cancel-btn {
          flex: 1;
          padding: 12px 24px;
          background-color: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .cancel-btn:hover:not(:disabled) {
          background-color: #4b5563;
        }

        .change-btn {
          flex: 1;
          padding: 12px 24px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .change-btn:hover:not(:disabled) {
          background-color: #5855eb;
        }

        .cancel-btn:disabled,
        .change-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .cancel-btn:disabled:hover,
        .change-btn:disabled:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ChangePasswordPage;
