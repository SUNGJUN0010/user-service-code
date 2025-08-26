import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfilePopup from '../components/ProfilePopup';

const MainBoardPage = ({ isLoggedIn, onLogout, profileImage, posts, setPosts, currentUser }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('최신순');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const navigate = useNavigate();

  const categories = [
    '전체',
    '동물/반려동물',
    '여행',
    '건강/헬스',
    '연예인'
  ];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  const handleLogoutClick = () => {
    onLogout();
    setShowProfilePopup(false);
  };

  const handleMyPageClick = () => {
    navigate('/mypage');
    setShowProfilePopup(false);
  };

  return (
    <div className="main-board-wrapper">
      <div className="main-board-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <Link to="/" className="logo-link">
              <img 
                src="/logo.png" 
                alt="먹구름 로고" 
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', fontSize: '24px', fontWeight: 'bold', color: 'var(--color-dark-navy)' }}>
                먹구름
              </div>
            </Link>
          </div>

          <div className="category-section">
            <h3 className="category-title">카테고리</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="main-content-area">
          {/* Header */}
          <div className="header">
            <div className="search-bar">
              <input
                type="text"
                placeholder="검색"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <span style={{ marginLeft: '8px', color: 'var(--color-placeholder-grey)' }}>🔍</span>
            </div>

            <div className="header-buttons">
                             {!isLoggedIn ? (
                 <>
                   <Link to="/cognito-signup" className="btn btn-secondary" style={{ marginRight: '12px' }}>
                     회원가입
                   </Link>
                   <Link to="/cognito-login" className="btn btn-primary">
                     로그인
                   </Link>
                 </>
               ) : (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={handleProfileClick}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                                         <div style={{ 
                       width: '40px', 
                       height: '40px', 
                       borderRadius: '50%', 
                       backgroundColor: 'var(--color-dark-navy)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: '16px',
                       fontWeight: 'bold'
                     }}>
                       👤
                     </div>
                    <span style={{ color: 'var(--color-text-default)' }}>
                      {currentUser?.username || '사용자'}
                    </span>
                  </button>
                  
                  {showProfilePopup && (
                    <ProfilePopup
                      onMyPage={handleMyPageClick}
                      onLogout={handleLogoutClick}
                      onClose={() => setShowProfilePopup(false)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="content-area">
            {/* Sort Tabs */}
            <div className="sort-tabs">
              <button
                className={`sort-tab ${sortBy === '최신순' ? 'active' : ''}`}
                onClick={() => handleSortChange('최신순')}
              >
                최신순
              </button>
              <button
                className={`sort-tab ${sortBy === '인기순' ? 'active' : ''}`}
                onClick={() => handleSortChange('인기순')}
              >
                인기순
              </button>
            </div>

            {/* Posts Area */}
            <div className="posts-area">
              {posts && posts.length > 0 ? (
                <div className="posts-grid">
                  {posts.map((post) => (
                    <div key={post.id} className="post-card">
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <div className="post-meta">
                        <span>{post.author}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-posts">
                  <p>작성한 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-board-wrapper {
          display: flex;
          height: 100vh;
          background-color: var(--color-default-bg);
        }

        .main-board-container {
          display: flex;
          width: 100%;
        }

        .sidebar {
          width: 240px;
          background-color: var(--color-default-bg);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: fixed;
          top: 0;
          height: 100vh;
          z-index: 10;
        }

        .sidebar-header {
          margin-bottom: 24px;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo-image {
          height: 80px;
          width: auto;
        }

        .category-section {
          width: 100%;
        }

        .category-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-title);
          margin-left: 16px;
          margin-bottom: 24px;
        }

        .category-list {
          list-style: none;
          padding: 0;
        }

        .category-list li {
          margin-bottom: 12px;
        }

        .category-btn {
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          border-radius: 999px;
          background-color: transparent;
          border: none;
          font-size: 14px;
          color: var(--color-text-light-grey);
          transition: all 0.2s;
          cursor: pointer;
        }

        .category-btn:hover {
          background-color: #ffffff85;
        }

        .category-btn.active {
          background-color: #ffffffb0;
          font-weight: 550;
          color: var(--color-text-default);
        }

        .main-content-area {
          flex: 1;
          margin-left: 240px;
          display: flex;
          flex-direction: column;
        }

        .header {
          background-color: var(--color-white);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: var(--color-white);
          border-radius: 9999px;
          padding: 8px 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--color-text-default);
          background: transparent;
        }

        .search-input::placeholder {
          color: var(--color-placeholder-grey);
        }

        .header-buttons {
          display: flex;
          align-items: center;
        }

        .content-area {
          flex: 1;
          padding: 24px;
        }

        .sort-tabs {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .sort-tab {
          padding: 8px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          color: var(--color-text-light-grey);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .sort-tab.active {
          color: var(--color-text-default);
          border-bottom-color: var(--color-dark-navy);
        }

        .posts-area {
          background-color: var(--color-white);
          border-radius: 12px;
          padding: 24px;
          min-height: 400px;
        }

        .no-posts {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: var(--color-text-light-grey);
          font-size: 18px;
        }

        .posts-grid {
          display: grid;
          gap: 16px;
        }

        .post-card {
          background-color: var(--color-default-bg);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .post-card:hover {
          transform: translateY(-2px);
        }

        .post-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 14px;
          color: var(--color-text-light-grey);
        }
      `}</style>
    </div>
  );
};

export default MainBoardPage;
