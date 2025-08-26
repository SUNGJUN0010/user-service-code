import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the new components
import MainBoardPage from "./pages/MainBoardPage";
import MyPage from "./pages/MyPage";
import MyPostsPage from "./pages/MyPostsPage"
import ChangePasswordPage from "./pages/ChangePasswordPage";
import FindIdentificationPage from "./pages/FindIdentificationPage";
import FindPasswordPage from "./pages/FindPasswordPage";
import SignUpPage from "./pages/SignUpPage";
import NewPostPage from "./pages/NewPostPage";
import PostDetailPage from "./pages/PostDetailPage";
import LoginPage from "./pages/LoginPage";

import "./styles/BaseDefault.css";
import "./styles/MainBoardPage.css";
import "./styles/FormPage.css";
import "./styles/MyPage.css";
import "./styles/PostDetailPage.css";
import "./styles/ProfilePopup.css";
import "./styles/LoginPage.css";
import "./styles/SignUpPage.css";
import "./styles/FindIdentificationPage.css";
import "./styles/FindPasswordPage.css";

export default function App() {
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const response = await fetch("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          setIsLoggedIn(true);
        } else {
          console.error("토큰이 유효하지 않습니다.");
          handleLogout();
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/posts");
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error("게시글을 가져오는 데 실패했습니다.");
        }
      } catch (error) {
        console.error("게시글 API 호출 중 오류 발생:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    alert("성공적으로 로그인 되었습니다!");
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setCurrentUser(null);
        setProfileImage(null);
        alert("로그아웃 되었습니다.");
      } else {
        alert("로그아웃에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      alert("로그아웃 처리 중 문제가 발생했습니다.");
    }
  };

  const addPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <Router>
      <Routes>
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
        <Route
          path="/MyPage"
          element={
            <MyPage
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/change-password"
          element={<ChangePasswordPage currentUser={currentUser} />}
        />
        <Route path="/findid" element={<FindIdentificationPage />} />
        <Route path="/findpassword" element={<FindPasswordPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/new-post"
          element={
            <NewPostPage
              isLoggedIn={isLoggedIn}
              profileImage={profileImage}
              onAddPost={addPost}
              currentUser={currentUser}
            />
          }
        />
        <Route
          path="/posts/:id"
          element={
            <PostDetailPage
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              profileImage={profileImage}
              posts={posts}
              currentUser={currentUser}
            />
          }
        />
        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} />}
        />
        <Route
          path="/myposts"
          element={
            <MyPostsPage
              isLoggedIn={isLoggedIn}
              profileImage={profileImage}
              posts={posts}
              setPosts={setPosts} // 이 줄을 임시로 추가합니다.css파일 수정 이후 다시 삭제합니다.
              currentUser={currentUser}
            />
          }
        />
      </Routes>
    </Router>
  );
}
