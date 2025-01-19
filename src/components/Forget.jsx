// src/components/Forget.jsx

import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // حذف کنید اگر فعلاً کاربرد ندارد

import { sendPasswordResetEmail } from "../utils/api";

import Pic1 from "../assets/pics/Component 1.png";
import Pic2 from "../assets/pics/Component 2.png";
import "../assets/css/common.css";
import "../assets/css/signup.css";

const Forget = () => {
  const [email, setEmail] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // const navigate = useNavigate(); // اگر موقتاً نیاز ندارید، کامنت کنید یا حذف کنید

  const validateEmail = () => {
    // حذف بک‌اسلش‌های اضافی برای dash
    const emailPattern = /^[a-zA-Z0-9._%+\]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setEmailErrorMessage("ایمیل وارد شده معتبر نیست.");
      return false;
    }
    setEmailErrorMessage("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    const isEmailValid = validateEmail();
    if (!isEmailValid) return;

    try {
      await sendPasswordResetEmail({ email });
      setSuccessMessage("ایمیل بازیابی رمز عبور با موفقیت ارسال شد.");

      // اگر خواستید به صفحه‌ی دیگر هدایت کنید:
      // navigate("/forget-done");
    } catch (error) {
      console.error("Password reset error:", error);
      setApiError("خطا در ارسال ایمیل بازیابی. لطفاً دوباره تلاش کنید یا از صحت ایمیل اطمینان حاصل کنید.");
    }
  };

  return (
    <div className="container whole_page">
      <img src={Pic1} alt="تصویر شماره 1" className="pic pic1" />

      <div className="login-form">
        <form className="form1" onSubmit={handleSubmit}>
          <h2 className="text-center vorood-txt">فراموشی رمز عبور</h2>

          <div className="form-group">
            <input
              type="email"
              className="form-control mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label>ایمیل</label>
            {emailErrorMessage && (
              <p className="error_message">{emailErrorMessage}</p>
            )}
          </div>

          {apiError && <p className="error_message">{apiError}</p>}
          {successMessage && <p className="success_message">{successMessage}</p>}

          <button type="submit" className="btn btn1 btn-block w-100 mb-4 mt-2">
            بازیابی رمز عبور
          </button>

          <div className="text-center">
            <a href="/login" className="forget">برگشت به ورود</a>
          </div>
        </form>
      </div>

      <img src={Pic2} alt="تصویر شماره 2" className="pic pic2" />
    </div>
  );
};

export default Forget;
