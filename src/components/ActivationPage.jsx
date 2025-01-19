// src/components/ActivationPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { activationConfirm } from "../utils/api";
import "../assets/css/activation.css";

function ActivationPage() {
  const { token } = useParams(); 
  const navigate = useNavigate();

  const [message, setMessage] = useState("در حال فعال‌سازی حساب کاربری...");
  const [error, setError] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setMessage("توکن فعال‌سازی یافت نشد!");
        setError(true);
        setShowResend(true);
        return;
      }

      console.log("Activation token:", token); 

      try {
        const response = await activationConfirm(token); // ارسال توکن به API
        console.log("Activation success:", response.data);

        setMessage("حساب شما با موفقیت فعال شد! در حال انتقال به صفحه ورود...");
        setError(false);

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        console.error("Activation error:", err.response || err.message || err);
        const errorMsg =
          err.response?.data?.detail || "فعال‌سازی حساب با مشکل مواجه شد. لطفاً دوباره تلاش کنید.";
        setMessage(errorMsg);
        setError(true);
        setShowResend(true);
      }
    };

    activateAccount();
  }, [token, navigate]);

  const handleResend = () => {
    // navigate("/resend-activation");
  };

  return (
    <div className="activation-page-container-custom">
      <div className="activation-card-custom">
        <h2 className="activation-title-custom">فعّالسازی حساب کاربری</h2>
        <p
          className={`activation-message-custom ${
            error ? "activation-error-custom" : "activation-success-custom"
          }`}
        >
          {message}
        </p>
        {showResend && error && (
          <button className="activation-btn-custom" onClick={handleResend}>
            ارسال دوباره ایمیل فعال‌سازی
          </button>
        )}
      </div>
    </div>
  );
}

export default ActivationPage;
