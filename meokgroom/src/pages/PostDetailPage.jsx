// import statements
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { User, Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import ProfilePopup from "../components/ProfilePopup";

// 개별 포스트 페이지 (댓글 추가/수정/삭제 포함)
function PostDetailPage({
  isLoggedIn,
  onLogout,
  profileImage,
  posts = [],
  setPosts = () => {},
  currentUser,
}) {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [post, setPost] = useState(state || null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const postRes = await fetch(`/posts/${id}`);
        if (!postRes.ok) throw new Error("게시물 로드 실패");
        const postData = await postRes.json();
        setPost(postData);

        const cmtRes = await fetch(`/posts/${id}/comments`);
        if (!cmtRes.ok) throw new Error("댓글 로드 실패");
        const cmtData = await cmtRes.json();
        setComments(cmtData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPostAndComments();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const method = "PATCH";
      const response = await fetch(`/posts/${id}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ liked: !liked }),
      });

      if (response.ok) {
        setLiked(!liked);
        setPost((prevPost) => {
          const newLikes = liked
            ? prevPost.likes.filter((name) => name !== currentUser.userName)
            : [...prevPost.likes, currentUser.userName];
          return { ...prevPost, likes: newLikes };
        });
      } else {
        alert("좋아요 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("좋아요 API 호출 중 오류 발생:", error);
      alert("좋아요 처리 중 문제가 발생했습니다.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          text: newComment,
          userName: currentUser?.userName,
        }),
      });

      if (!response.ok) {
        alert("댓글 작성에 실패했습니다.");
        return;
      }

      const data = await response.json();
      const addedComment = data.comment || data;
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");

      setPost((prev) =>
        prev ? { ...prev, comments: (prev.comments || 0) + 1 } : prev
      );
      setPosts((prev) =>
        Array.isArray(prev)
          ? prev.map((p) =>
              p.id === Number(id) || p.id === post?.id
                ? { ...p, comments: p.comments + 1 }
                : p
            )
          : prev
      );
    } catch (err) {
      console.error("댓글 작성 오류:", err);
    }
  };

  const startEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const saveEditComment = async () => {
    if (!editingCommentId) return;
    const text = editedCommentText.trim();
    if (!text) return;

    try {
      const response = await fetch(`/comments/${editingCommentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        alert("댓글 수정에 실패했습니다.");
        return;
      }

      const data = await response.json();
      const updated = data.comment || data;

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingCommentId
            ? { ...c, text: updated.text ?? text }
            : c
        )
      );
      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (err) {
      console.error("댓글 수정 오류:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 댓글을 삭제하시겠습니까?")) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("댓글이 삭제되었습니다.");
        setComments(comments.filter((comment) => comment.id !== commentId));
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제 중 문제가 발생했습니다.");
    }
  };

  const handleEditPost = async () => {
    if (isEditing) {
      try {
        const response = await fetch(`/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ content: editedContent }),
        });
        if (!response.ok) {
          alert("게시물 수정에 실패했습니다.");
          return;
        }
        const updatedPost = await response.json();
        setPost(updatedPost);
        setIsEditing(false);

        setPosts((prev) =>
          Array.isArray(prev)
            ? prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
            : prev
        );
      } catch (err) {
        console.error("게시물 수정 오류:", err);
      }
    } else {
      setIsEditing(true);
      setEditedContent(post?.content || "");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("게시물을 정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) {
        alert("게시물 삭제에 실패했습니다.");
        return;
      }
      alert("게시물이 삭제되었습니다.");
      setPosts((prev) =>
        Array.isArray(prev)
          ? prev.filter((p) => p.id !== (post?.id ?? Number(id)))
          : prev
      );
      navigate("/");
    } catch (err) {
      console.error("게시물 삭제 오류:", err);
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className="post-detail-page">
      <header className="main-header">
        <div className="right-header-wrapper">
          <div className="search-bar-container">
            <input
              type="text"
              placeholder="검색"
              className="search-input"
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
                  onClick={() => setShowProfilePopup((v) => !v)}
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
        </div>
      </header>

      <div className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Logo" className="logo-image" />
          </Link>
        </div>
        <div className="category-section">
          <h3 className="category-title">카테고리</h3>
          <ul className="category-list">
            <li>
              <button className="category-btn active">전체</button>
            </li>
            <li>
              <button className="category-btn">동물/반려동물</button>
            </li>
            <li>
              <button className="category-btn">여행</button>
            </li>
            <li>
              <button className="category-btn">건강/헬스</button>
            </li>
            <li>
              <button className="category-btn">연예인</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="post-detail-card">
        <div className="post-author-section">
          <div className="author-avatar">👤</div>
          <div className="author-info">
            <p className="author-name">{post.userName}</p>
            <p className="post-date">{post.date}</p>
          </div>
        </div>

        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="post" />
          </div>
        )}

        <h2 className="post-title">{post.title}</h2>
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full border rounded p-2"
          />
        ) : (
          <p className="post-content">{post.content}</p>
        )}

        <div className="post-stats">
          <button onClick={handleLike}>
            <span>
              <Heart fill={liked ? "red" : "none"} /> {post.likes}
            </span>
          </button>
          <span>
            <MessageCircle /> {post.comments}
          </span>
        </div>

        <div className="post-actions">
          <button onClick={handleEditPost} className="action-btn">
            <Pencil />
          </button>
          <button onClick={handleDeletePost} className="action-btn">
            <Trash2 />
          </button>
        </div>

        <div className="comment-section">
          <h3>댓글</h3>
          <div className="comment-input flex space-x-2 mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 border rounded px-2 py-1"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-1 bg-blue-500 text-white rounded"
            >
              등록
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {comments.map((c) => (
              <li key={c.id} className="border-b pb-2">
                {editingCommentId === c.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedCommentText}
                      onChange={(e) => setEditedCommentText(e.target.value)}
                      className="flex-1 border rounded px-2 py-1"
                    />
                    <button
                      onClick={saveEditComment}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEditComment}
                      className="px-3 py-1 bg-gray-300 rounded"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span>
                      <strong>{c.userName}</strong>: {c.text}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditComment(c.id, c.text)}
                        className="action-btn"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="action-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;