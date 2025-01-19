// src/pages/VerifyAccount.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/verifyaccount.css";

function VerifyAccount() {
  const navigate = useNavigate();

  const handleResend = () => {
    navigate("/activation-resend");
  };

  return (
    <div className="verify-account-page-container">
      <div className="verify-account-card">
        <h2 className="verify-account-title">تأیید حساب کاربری</h2>
        <p className="verify-account-message">
          لینک فعال‌سازی به ایمیل شما ارسال شده است. لطفاً صندوق ورودی خود را بررسی کنید.
        </p>
        <p className="verify-account-message">
          اگر ایمیل را دریافت نکرده‌اید، می‌توانید با کلیک بر روی دکمه زیر آن را مجدداً ارسال کنید.
        </p>
        <button className="verify-account-btn" onClick={handleResend}>
          ارسال دوباره ایمیل فعال‌سازی
        </button>
      </div>
    </div>
  );
}

export default VerifyAccount;
