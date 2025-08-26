import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'aws-amplify/auth';

const MyPage = ({ profileImage, setProfileImage, currentUser, onLogout }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 파일 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/users/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('프로필 이미지가 업로드되었습니다.');
        setSelectedFile(null);
      } else {
        alert('업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말로 계정을 탈퇴하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      // AWS Cognito에서 현재 사용자 계정 삭제
      await deleteUser();
      
      // 로컬 상태 정리
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // 로그아웃 처리
      if (onLogout) {
        onLogout();
      }
      
      alert('계정이 성공적으로 삭제되었습니다.');
      navigate('/');
      
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      
      if (error.code === 'NotAuthorizedException') {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        if (onLogout) {
          onLogout();
        }
        navigate('/cognito-login');
      } else if (error.code === 'UserNotConfirmedException') {
        alert('계정이 확인되지 않았습니다. 이메일 확인을 완료해주세요.');
      } else {
        alert('계정 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mypage-container">
      {/* 헤더 네비게이션 */}
      <div className="header-navigation">
        <button 
          onClick={() => navigate('/')} 
          className="home-btn"
        >
          🏠 메인페이지로
        </button>
      </div>
      
      <div className="mypage-content">
        {/* 프로필 섹션 */}
        <div className="profile-section">
          <div className="profile-image-container">
            {profileImage ? (
              <img src={profileImage} alt="프로필" className="profile-image" />
            ) : (
              <div className="profile-placeholder">👤</div>
            )}
          </div>
          
          <div className="user-info">
            <h2>Welcome, {currentUser?.username || 'qwer'}</h2>
            <p>{currentUser?.username || 'qwer'}</p>
          </div>
        </div>

        {/* 파일 업로드 섹션 */}
        <div className="upload-section">
          <h3>업로드</h3>
          <div className="upload-controls">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-select-link">
              파일 선택
            </label>
            <span className="selected-file">
              {selectedFile ? selectedFile.name : '선택된 파일 없음'}
            </span>
          </div>
          {selectedFile && (
            <button onClick={handleUpload} className="upload-btn">
              업로드
            </button>
          )}
        </div>

        {/* 액션 링크들 */}
        <div className="action-links">
          <button 
            onClick={() => navigate('/change-password')} 
            className="action-link"
          >
            비밀번호 변경
          </button>
          
          <button 
            onClick={() => navigate('/myposts')} 
            className="action-link"
          >
            작성글 조회
          </button>
        </div>

        {/* 계정 탈퇴 버튼 */}
        <div className="delete-section">
          <button 
            onClick={handleDeleteAccount}
            className="delete-btn"
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '계정 탈퇴'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .mypage-container {
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

        .mypage-content {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .profile-section {
          margin-bottom: 32px;
        }

        .profile-image-container {
          margin-bottom: 16px;
        }

        .profile-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          margin: 0 auto;
        }

        .user-info h2 {
          color: #1f2937;
          margin-bottom: 4px;
          font-size: 20px;
          font-weight: 600;
        }

        .user-info p {
          color: #1f2937;
          margin: 0;
          font-size: 16px;
        }

        .upload-section {
          margin-bottom: 32px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
        }

        .upload-section h3 {
          color: #1f2937;
          margin-bottom: 16px;
          font-size: 16px;
          font-weight: 600;
        }

        .upload-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
        }

        .file-select-link {
          color: #1f2937;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
        }

        .file-select-link:hover {
          text-decoration: underline;
        }

        .selected-file {
          color: #6b7280;
          font-size: 14px;
        }

        .upload-btn {
          padding: 8px 16px;
          background-color: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 12px;
        }

        .upload-btn:hover {
          background-color: #5855eb;
        }

        .action-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .action-link {
          background: none;
          border: none;
          color: #1f2937;
          cursor: pointer;
          font-size: 16px;
          padding: 8px 0;
          text-align: center;
          text-decoration: none;
        }

        .action-link:hover {
          text-decoration: underline;
        }

        .delete-section {
          margin-top: 16px;
        }

        .delete-btn {
          width: 100%;
          padding: 12px 24px;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
        }

        .delete-btn:hover {
          background-color: #b91c1c;
        }

        .delete-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .delete-btn:disabled:hover {
          background-color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default MyPage;
