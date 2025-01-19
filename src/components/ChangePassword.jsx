import React, { useState } from "react";
import '../assets/css/common.css';
import '../assets/css/signup.css';
import Pic1 from "../assets/pics/Component 1.png";
import Pic2 from "../assets/pics/Component 2.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// تابع changePassword از فایل API
import { changePassword } from "../utils/api"; // مسیر را با توجه به ساختار پروژه خود تصحیح کنید

// ایمپورت کامپوننت Notification
import Notification from "../components/adminpanel/Notification"; // مسیر را متناسب با محل فایل پروژه‌تان اصلاح کنید

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // برای نمایش پیام‌های نوتیفیکیشن
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState(""); // "success" یا "error"

  // اعتبارسنجی حداقلی برای اینکه رمز عبور جدید و تأیید آن یکی باشند
  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setNotificationMessage("رمز عبور جدید و تکرار آن مطابقت ندارند.");
      setNotificationType("error");
      return false;
    }
    if (newPassword.length < 8) {
      setNotificationMessage("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
      setNotificationType("error");
      return false;
    }
    // پاک کردن پیغام احتمالی قبلی
    setNotificationMessage("");
    setNotificationType("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // اعتبارسنجی اولیه
    if (!validatePassword()) return;

    try {
      // داده‌ای که باید به سرور بفرستیم
      const requestData = {
        old_password: currentPassword,
        new_password: newPassword,
        new_password1: confirmPassword
      };

      // فراخوانی API
      await changePassword(requestData);

      // در صورت موفقیت
      setNotificationMessage("رمز عبور با موفقیت تغییر یافت.");
      setNotificationType("success");

      // ریست کردن ورودی‌ها
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // مدیریت خطا
      let message = "خطایی در ارتباط با سرور رخ داده است.";
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        if (serverErrors.old_password) {
          message = serverErrors.old_password[0];
        } else if (serverErrors.new_password) {
          message = serverErrors.new_password[0];
        } else if (serverErrors.new_password1) {
          message = serverErrors.new_password1[0];
        } else {
          message = "خطایی رخ داده است.";
        }
      }
      setNotificationMessage(message);
      setNotificationType("error");
    }
  };

  // بسته شدن خودکار نوتیفیکیشن پس از 3 ثانیه
  const handleNotificationClose = () => {
    setNotificationMessage("");
    setNotificationType("");
  };

  return (
    <div className="container whole_page">
      {/* نمایش نوتیفیکیشن در صورت وجود پیام */}
      <Notification
        message={notificationMessage}
        type={notificationType}
        onClose={handleNotificationClose}
      />

      <img src={Pic1} alt="تصویر شماره 1" className="pic pic1" />

      <div className="login-form">
        <form className="form1" onSubmit={handleSubmit}>
          <h2 className="text-center vorood-txt">تغییر رمز عبور</h2>

          <div className="form-group">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="form-control pass1 mt-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="current-password" className="ms-3">
              رمز عبور فعلی
            </label>
            <span
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="form-group">
            <input
              type={showNewPassword ? "text" : "password"}
              className="form-control pass1 mt-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="new-password" className="ms-3">
              رمز عبور جدید
            </label>
            <span
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="form-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control pass1 mt-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="confirm-password" className="ms-3">
              تأیید رمز عبور جدید
            </label>
            <span
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="btn btn1 w-100 mb-2">
            تأیید و تنظیم رمز عبور
          </button>
        </form>
      </div>
      <img src={Pic2} alt="تصویر شماره 2" className="pic pic2" />
    </div>
  );
}

export default ChangePassword;
