import React from 'react';

const ProfilePopup = ({ onMyPage, onLogout, onClose }) => {
  return (
    <div className="profile-popup">
      <div className="profile-item" onClick={onMyPage}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>👤</span>
        마이페이지
      </div>
      <div className="profile-item" onClick={onLogout}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>🚪</span>
        로그아웃
      </div>
    </div>
  );
};

export default ProfilePopup;
