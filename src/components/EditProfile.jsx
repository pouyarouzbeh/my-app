// src/components/EditProfile.jsx

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfileById,
  updateProfileById
} from "../utils/api";

import "../assets/css/editprofile.css";

import Notification from "./adminpanel/Notification";
import { Form, Button, Container, Spinner } from "react-bootstrap";
import { AuthContext } from "./context/AuthContext";

const EditProfile = () => {
  const { user, updateUser } = useContext(AuthContext); // دریافت اطلاعات کاربر از Context

  // وضعیت‌های کامپوننت
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    // افزودن فیلدهای بیشتر در صورت نیاز
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // دریافت اطلاعات پروفایل هنگام بارگذاری کامپوننت
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.isLoggedIn) {
        setError("ابتدا وارد حساب کاربری خود شوید.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await getProfileById(user.id);
        setProfile({
          username: response.data.username || "",
          email: response.data.email || "",
          first_name: response.data.first_name || "",
          last_name: response.data.last_name || "",
          phone_number: response.data.phone_number || "",
          // افزودن فیلدهای بیشتر در صورت نیاز
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "خطا در دریافت اطلاعات پروفایل.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id, user.isLoggedIn]);

  // مدیریت تغییرات فرم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // مدیریت ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    // اعتبارسنجی ساده
    if (!profile.email) {
      setError("لطفاً ایمیل خود را وارد کنید.");
      setUpdating(false);
      return;
    }

    try {
      await updateProfileById(user.id, profile);
      // می‌خواهیم آخرین وضعیت از سرور بخوانیم
      const { data: updatedData } = await getProfileById(user.id);
    
      // حالا بروزرسانی کانتکست از آخرین دادهٔ واقعی سرور
      updateUser({
        email: updatedData.email,
        first_name: updatedData.first_name,
        last_name: updatedData.last_name,
        phone_number: updatedData.phone_number,
        // هر فیلد دیگری
      });
      setSuccess("پروفایل با موفقیت به‌روزرسانی شد.");

      // هدایت به صفحه اصلی پس از نمایش پیغام موفقیت
      setTimeout(() => {
        navigate("/");
      }, 1000); // ۲ ثانیه
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "خطا در به‌روزرسانی پروفایل.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container className="edit-profile-container mt-5">
      <h2 className="mb-4 text-center">ویرایش پروفایل</h2>

      {/* نمایش پیام‌های خطا و موفقیت */}
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError("")}
          uniqueClass="edit-profile-error-notification"
        />
      )}
      {success && (
        <Notification
          message={success}
          type="success"
          onClose={() => setSuccess("")}
          uniqueClass="edit-profile-success-notification"
        />
      )}

      {/* نمایش اسپینر بارگذاری */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="edit-profile-form">
          {/* نام کاربری (غیر قابل ویرایش) */}
          <Form.Group controlId="username" className="mb-3">
            <Form.Label>نام کاربری</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled
            />
          </Form.Group>

          {/* ایمیل */}
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>ایمیل</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled
            />
          </Form.Group>

          {/* نام */}
          <Form.Group controlId="first_name" className="mb-3">
            <Form.Label>نام</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleChange}
            />
          </Form.Group>

          {/* نام خانوادگی */}
          <Form.Group controlId="last_name" className="mb-3">
            <Form.Label>نام خانوادگی</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleChange}
            />
          </Form.Group>

          {/* شماره تماس */}
          <Form.Group controlId="phone_number" className="mb-3">
            <Form.Label>شماره تماس</Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
            />
          </Form.Group>

          {/* افزودن فیلدهای بیشتر در صورت نیاز */}

          {/* دکمه ارسال */}
          <Button variant="primary" type="submit" className="save_editinfo_btn" disabled={updating}>
            {updating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                در حال ارسال...
              </>
            ) : (
              "ذخیره تغییرات"
            )}
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default EditProfile;
