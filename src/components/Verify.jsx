// src/components/Verify.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// اگر در api.js تابع confirmPasswordReset را دارید:
import { confirmPasswordReset } from "../utils/api";

import "../assets/css/common.css";
import "../assets/css/signup.css";
import Pic1 from "../assets/pics/Component 1.png";
import Pic2 from "../assets/pics/Component 2.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Verify() {
  const { uid, token } = useParams(); 
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validatePassword = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("رمز عبور و تکرار آن یکسان نیستند.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      // فراخوانی متد confirmPasswordReset:
      await confirmPasswordReset(uid, token, {
        new_password: newPassword,
        re_new_password: confirmPassword,
      });
      setSuccessMessage("رمز عبور با موفقیت تغییر یافت!");
      // مثلاً به صفحهٔ لاگین بروید
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setErrorMessage("خطا در تغییر رمز عبور. لطفاً مجدداً تلاش کنید.");
    }
  };

  return (
    <div className="container whole_page">
      <img src={Pic1} alt="تصویر شماره 1" className="pic pic1" />

      <div className="login-form">
        <form className="form1" onSubmit={handleSubmit}>
          <h2 className="text-center vorood-txt">تنظیم رمز عبور جدید</h2>

          <div className="form-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pass1 mt-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              pattern=".{8,}"
              title="رمز عبور باید حداقل ۸ کاراکتر باشد."
              placeholder=" "
              required
            />
            <label className="ms-3">رمز عبور جدید</label>
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="form-group password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pass1 mt-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              pattern=".{8,}"
              title="رمز عبور باید حداقل ۸ کاراکتر باشد."
              placeholder=" "
              required
            />
            <label className="ms-3">تأیید رمز عبور</label>
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {errorMessage && <p className="error_message">{errorMessage}</p>}
          {successMessage && <p className="success_message">{successMessage}</p>}

          <button type="submit" className="btn btn1 w-100 mb-2">
            تأیید و تنظیم رمز عبور
          </button>
        </form>
      </div>

      <img src={Pic2} alt="تصویر شماره 2" className="pic pic2" />
    </div>
  );
}

export default Verify;
