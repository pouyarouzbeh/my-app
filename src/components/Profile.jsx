import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "../assets/css/common.css";
import "../assets/css/profile.css";
import profile_img from "../assets/pics/profile.png";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap"; // اضافه کردن مدال و دکمه از بوت استرپ

import { getProfileById, getCourseHistory } from "../utils/api";

const ProfileSidebar = ({ profileData, isAdmin }) => {
  return (
    <aside className="profile-sidebar">
      <img src={profile_img} alt="تصویر پروفایل" className="profile-image" />
      <h2>{profileData ? `${profileData.first_name} ${profileData.last_name}` : "نام کاربر"}</h2>
      <p>{isAdmin ? "مدیر سیستم" : "دانشجو"}</p>

      <div className="info-item mt-4">
        <span className="info-label">شماره دانشجویی:</span>
        <span className="info-value ms-1">
          {profileData?.username || "ثبت نشده"}
        </span>
      </div>

      <div className="info-item">
        <span className="info-label">شماره تماس:</span>
        <span className="info-value ms-1">
          {profileData?.phone_number || "نامشخص"}
        </span>
      </div>
    </aside>
  );
};

const CourseHistory = ({ courseHistory }) => {
  return (
    <section className="profile-card">
      <h3>تاریخچه دروس</h3>
      <ul className="courses-list">
        {courseHistory.length > 0 ? (
          courseHistory.map((item, index) => (
            <li
              key={index}
              className={
                item.status === "completed" ? "passed-course" : "failed-course"
              }
            >
              <span className="course-name">{item.course}</span>
              <span className="course-grade">نمره: {item.grade}</span>
              <span className="course-status">
                وضعیت: {item.status === "completed" ? "پاس شده" : "افتاده"}
              </span>
            </li>
          ))
        ) : (
          <li className="no-data">هیچ داده‌ای موجود نیست</li>
        )}
      </ul>
    </section>
  );
};

const ProfileActions = ({ onEdit, onEditProfile, onLogout }) => {
  return (
    <section className="profile-actions">
      <button className="btn btn-edit-profile" onClick={onEdit}>
        تغییر رمز عبور
      </button>

      <button className="btn btn-edit-profile" onClick={onEditProfile}>
        تکمیل اطلاعات پروفایل
      </button>

      <button className="btn btn-exit" onClick={onLogout}>
        خروج
      </button>
    </section>
  );
};

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [courseHistory, setCourseHistory] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // کنترل نمایش مدال

  const handleEdit = () => navigate("/change_password");
  const handleEditProfile = () => navigate("/edit-profile");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (user.isLoggedIn && user.id) {
      getProfileById(user.id)
        .then((response) => {
          setProfileData(response.data);
        })
        .catch((err) => {
          setError("خطا در دریافت پروفایل کاربر");
        });
    }
  }, [user.isLoggedIn, user.id]);

  useEffect(() => {
    if (user.isLoggedIn && user.id && profileData) {
      getCourseHistory(user.id)
        .then((response) => {
          const historyData = Array.isArray(response.data.results)
            ? response.data.results
            : [];
          const filteredHistory = historyData.filter(
            (item) => item.username === profileData.username
          );
          setCourseHistory(filteredHistory);
        })
        .catch((error) => {
          setError("خطا در دریافت تاریخچه درس‌ها");
        });
    }
  }, [user.isLoggedIn, user.id, profileData]);

  if (!profileData && user.isLoggedIn) {
    return <p className="loading">در حال بارگذاری پروفایل...</p>;
  }

  const isAdmin = user.is_admin;

  return (
    <div className="student-profile-container">
      <ProfileSidebar profileData={profileData} isAdmin={isAdmin} />

      <main className="profile-main">
        <CourseHistory courseHistory={courseHistory} />

        <ProfileActions
          onEdit={handleEdit}
          onEditProfile={handleEditProfile}
          onLogout={() => setShowModal(true)} // نمایش مدال هنگام کلیک روی دکمه خروج
        />

        {error && <p className="error-message">{error}</p>}

        {/* مدال خروج */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>خروج از سیستم</Modal.Title>
          </Modal.Header>
          <Modal.Body>آیا مطمئن هستید که می‌خواهید از سیستم خارج شوید؟</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              انصراف
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              خروج
            </Button>
          </Modal.Footer>
        </Modal>
      </main>
    </div>
  );
};

export default Profile;
