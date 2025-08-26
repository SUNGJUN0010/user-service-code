// import statements
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Heart, MessageCircle } from "lucide-react";
import ProfilePopup from "../components/ProfilePopup";

// 메인보드페이지
function MainBoardPage({
  isLoggedIn,
  onLogout,
  profileImage,
  posts,
  setPosts,
  currentUser,
}) {
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const filteredPosts = posts.filter(
    (post) =>
      (activeCategory === "전체" || post.category === activeCategory) &&
      (post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.title &&
          post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const sortedAndFilteredPosts = [...filteredPosts].sort((a, b) => {
    if (sortOrder === "popular") {
      return b.likes - a.likes;
    }
    return b.id - a.id;
  });
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedAndFilteredPosts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );
  const totalPages = Math.ceil(sortedAndFilteredPosts.length / postsPerPage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = ["전체", "동물/반려동물", "여행", "건강/헬스", "연예인"];
  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (newPostContent.trim() === "") {
      alert("내용을 입력해주세요.");
      return;
    }

    const newPost = {
      title: "",
      content: newPostContent,
      userName: currentUser.userName,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: [],
      profileImage: profileImage,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setIsModalOpen(false);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  return (
    <div className="main-board-wrapper">
      <div className="main-board-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <Link to="/" className="logo-link">
              <img src="/logo.png" alt="Logo" className="logo-image" />
            </Link>
          </div>
          <div className="category-section">
            <h3 className="category-title">카테고리</h3>
            <ul className="category-list">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    className={`category-btn ${
                      activeCategory === category ? "active" : ""
                    }`}
                    onClick={() => setActiveCategory(category)}
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
          {/* Header with Search and Profile */}
          <header className="main-header">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="검색"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
            <div className="header-actions">
              {isLoggedIn ? (
                <div className="profile-container relative">
                  <button
                    className="profile-btn"
                    onClick={() => setShowProfilePopup(!showProfilePopup)}
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User />
                    )}
                  </button>
                  {showProfilePopup && (
                    <ProfilePopup
                      onClose={() => setShowProfilePopup(false)}
                      onLogout={onLogout}
                      profileImage={profileImage}
                      currentUser={currentUser}
                    />
                  )}
                </div>
              ) : (
                <>
                  <Link to="/signup" className="signup-btn">
                    회원가입
                  </Link>
                  <Link to="/login" className="login-btn">
                    로그인
                  </Link>
                </>
              )}
            </div>
          </header>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${
                sortOrder === "latest" ? "active" : ""
              }`}
              onClick={() => setSortOrder("latest")}
            >
              최신순
            </button>
            <button
              className={`sort-btn ${
                sortOrder === "popular" ? "active" : ""
              }`}
              onClick={() => setSortOrder("popular")}
            >
              인기순
            </button>
            {isLoggedIn && (
              <button
                className="post-create-btn"
                onClick={() => navigate("/new-post")}
              >
                새 게시물 작성
              </button>
            )}
          </div>
          <div className="post-list">
            {currentPosts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() =>
                  navigate(`/posts/${post.id}`, { state: post })
                }
                style={{ cursor: "pointer" }}
              >
                <div className="post-header">
                  <div className="post-author">{post.userName}</div>
                  <div className="post-stats">
                    <span className="stat-item">
                      <Heart />
                      <span className="stat-count">{post.likes}</span>
                    </span>
                    <span className="stat-item">
                      <MessageCircle />
                      <span className="stat-count">{post.comments}</span>
                    </span>
                  </div>
                </div>
                <p className="post-content">{post.content}</p>
              </div>
            ))}
            {currentPosts.length === 0 && (
              <p className="no-posts-message">작성한 게시글이 없습니다.</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`page-btn ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">새 게시물 작성</h3>
            <form onSubmit={handlePostSubmit}>
              <textarea
                className="modal-textarea"
                placeholder="내용을 입력하세요..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  작성하기
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainBoardPage;