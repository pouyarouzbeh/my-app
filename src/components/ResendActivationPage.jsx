import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resendActivation } from "../utils/api";
import "../assets/css/resend-activation-page.css";

function ResendActivationPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    try {
      const response = await resendActivation(); 
      console.log("Resend activation success:", response.data);
      setMessage("ایمیل فعال‌سازی مجدداً ارسال شد!");
      setError(false);


      setTimeout(() => {
        navigate("/verify-account");
      }, 3000);
    } catch (err) {
      console.error("Resend activation error:", err);
      setMessage("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      setError(true);
    }
  };

  return (
    <div className="resend-activation-page-container">
      <div className="resend-activation-card">
        <h2 className="resend-activation-title">ارسال دوباره ایمیل فعال‌سازی</h2>
        <p className="resend-activation-description">
          با کلیک بر روی دکمه زیر، ایمیل فعال‌سازی مجدداً ارسال می‌شود.
        </p>
        <button className="resend-activation-btn" onClick={handleResend}>
          ارسال مجدد ایمیل
        </button>

        {message && (
          <p
            className={`resend-activation-message ${
              error ? "resend-activation-error" : "resend-activation-success"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResendActivationPage;
