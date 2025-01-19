// src/components/Profile.jsx

import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "../assets/css/common.css";
import "../assets/css/profile.css";
import profile_img from "../assets/pics/profile.png";
import { useNavigate } from "react-router-dom";

import { getProfileById, getCourseHistory } from "../utils/api";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [courseHistory, setCourseHistory] = useState([]); // تاریخچه دروس
  const [error, setError] = useState("");

  const handleEdit = () => {
    navigate("/change_password");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "آیا مطمئن هستید که می‌خواهید از سیستم خارج شوید؟"
    );
    if (confirmLogout) {
      logout();
      navigate("/login");
    }
  };

  // استفاده از useEffect برای دریافت اطلاعات پروفایل
  useEffect(() => {
    if (user.isLoggedIn && user.id) {
      // گرفتن اطلاعات پروفایل کاربر
      getProfileById(user.id)
        .then((response) => {
          console.log("دریافت پروفایل:", response);
          setProfileData(response.data);
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          setError("خطا در دریافت پروفایل کاربر");
        });
    }
  }, [user.isLoggedIn, user.id]);

  // استفاده از useEffect برای دریافت و فیلتر کردن تاریخچه دروس
  useEffect(() => {
    if (user.isLoggedIn && user.id && profileData) {
      // گرفتن تاریخچه دروس کاربر با استفاده از ID
      getCourseHistory(user.id)
        .then((response) => {
          console.log("دریافت تاریخچه درس‌ها:", response);
          // فرض بر این است که تاریخچه دروس در data.results قرار دارد
          const historyData = Array.isArray(response.data.results)
            ? response.data.results
            : [];
          // فیلتر کردن نتایج بر اساس یوزرنیم کاربر
          const filteredHistory = historyData.filter(
            (item) => item.username === profileData.username
          );
          setCourseHistory(filteredHistory);
          console.log("داده‌های تاریخچه درس‌ها پس از فیلتر:", filteredHistory);
        })
        .catch((error) => {
          console.error("Error fetching course history:", error);
          setError("خطا در دریافت تاریخچه درس‌ها");
        });
    }
  }, [user.isLoggedIn, user.id, profileData]);

  if (!profileData && user.isLoggedIn) {
    return <p>در حال بارگذاری پروفایل...</p>;
  }

  const getFullName = () => {
    if (profileData) {
      return profileData.first_name + " " + profileData.last_name;
    }
    return "نام کاربر";
  };

  const isAdmin = user.is_admin; // اصلاح شده

  return (
    <div className="student-profile-container">
      <aside className="profile-sidebar">
        <img src={profile_img} alt="تصویر پروفایل" className="profile-image" />
        <h2>{getFullName()}</h2>
        <p>{isAdmin ? "مدیر سیستم" : "دانشجو"}</p>

        <div className="info-item mt-4">
          <span className="info-label">شماره دانشجویی:</span>
          <span className="info-value ms-1">
            {profileData?.username || "ثبت نشده"}
          </span>
        </div>
        {/* <div className="info-item">
          <span className="info-label">معدل ترم قبل:</span>
          <span className="info-value ms-1">
            {profileData?.last_average || "نامشخص"}
          </span>
        </div> */}
        <div className="info-item">
          <span className="info-label">شماره تماس:</span>
          <span className="info-value ms-1">
            {profileData?.phone_number || "نامشخص"}
          </span>
        </div>
      </aside>

      <main className="profile-main">
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
                  <span>{item.course}</span>{" "}
                  <span>نمره: {item.grade}</span>{" "}
                  <span>
                    وضعیت:{" "}
                    {item.status === "completed" ? "پاس شده" : "افتاده"}
                  </span>
                </li>
              ))
            ) : (
              <li>هیچ داده‌ای موجود نیست</li>
            )}
          </ul>
        </section>

        <section className="profile-actions">
          <button className="btn btn-edit-profile" onClick={handleEdit}>
            تغییر رمز عبور
          </button>

          <button className="btn btn-edit-profile" onClick={handleEditProfile}>
            تکمیل اطلاعات پروفایل
          </button>

          <button className="btn btn-exit1" onClick={handleLogout}>
            خروج
          </button>
        </section>
        {error && <p className="error-message">{error}</p>}
      </main>
    </div>
  );
};

export default Profile;
