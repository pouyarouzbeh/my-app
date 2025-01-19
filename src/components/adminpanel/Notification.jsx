// Notification.jsx
import React, { useEffect } from "react";
import "./notification.css"; // فایل استایل برای انیمیشن

const Notification = ({ message, type, onClose }) => {
  // پس از 3 ثانیه خودکار پیام بسته می‌شود
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return <div className={`notification ${type}`}>{message}</div>;
};

export default Notification;
