// src/components/EditProfile.jsx

import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation(); // دریافت location برای پیام از navigate
  const navigate = useNavigate();

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
  const [error, setError] = useState(location.state?.message || ""); // تنظیم پیام اولیه از state
  const [success, setSuccess] = useState("");
  
  // دریافت اطلاعات پروفایل هنگام بارگذاری کامپوننت
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user.isLoggedIn) {
        setError("ابتدا وارد حساب کاربری خود شوید.");
        return;
      }

      setLoading(true);
      setError(location.state?.message || ""); // تنظیم پیام از state در ابتدا
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
  }, [user.id, user.isLoggedIn, location.state]);

  // مدیریت تغییرات فرم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    // اعتبارسنجی فرم
    if (!profile.first_name.trim()) {
      setError("لطفاً نام خود را وارد کنید.");
      setUpdating(false);
      return;
    }

    if (!profile.last_name.trim()) {
      setError("لطفاً نام خانوادگی خود را وارد کنید.");
      setUpdating(false);
      return;
    }

    if (!profile.phone_number.trim()) {
      setError("لطفاً شماره تماس خود را وارد کنید.");
      setUpdating(false);
      return;
    }

    // اعتبارسنجی شماره تلفن (اختیاری)
    const phoneRegex = /^[0-9]{11}$/; // مثال: شماره تلفن 11 رقمی
    if (!phoneRegex.test(profile.phone_number)) {
      setError("لطفاً یک شماره تماس معتبر وارد کنید.");
      setUpdating(false);
      return;
    }

    try {
      await updateProfileById(user.id, profile);
      
      const { data: updatedData } = await getProfileById(user.id);
    
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
      }, 2000); // ۲ ثانیه
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

          {/* ایمیل (غیر قابل ویرایش) */}
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
            <Form.Label>نام <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={profile.first_name}
              className="text-start"
              onChange={handleChange}
              required
              placeholder="نام خود را وارد کنید"
            />
          </Form.Group>

          {/* نام خانوادگی */}
          <Form.Group controlId="last_name" className="mb-3">
            <Form.Label>نام خانوادگی <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={profile.last_name}
              className="text-start"
              onChange={handleChange}
              required
              placeholder="نام خانوادگی خود را وارد کنید"
            />
          </Form.Group>

          {/* شماره تماس */}
          <Form.Group controlId="phone_number" className="mb-3">
            <Form.Label>شماره تماس <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={profile.phone_number}
              className="text-start"
              onChange={handleChange}
              required
              placeholder="شماره تماس خود را وارد کنید"
            />
            <Form.Text className="text-muted">
              لطفاً شماره تماس معتبر (11 رقمی) وارد کنید.
            </Form.Text>
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
