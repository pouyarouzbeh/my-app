import React, { useState } from "react";
import { postContact } from "../utils/api"; 
import Notification from "./adminpanel/Notification";
import "../assets/css/home.css"; // 

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" }); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const contactData = {
      name,
      email,
      subject,
      message,
    };

    try {
      // ارسال فرم به سرور
      await postContact(contactData);
      setNotification({
        message: "پیام شما با موفقیت ارسال شد.",
        type: "success", // نوع موفقیت
      });

      // پاک کردن فیلدهای فرم
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setNotification({
        message: "ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.",
        type: "error", // نوع خطا
      });
      console.error("Error sending contact message:", error);
    }
  };

  return (
    <div className="contact-form-section py-5">
      <div className="container">
        <h2 className="mb-5">تماس با ما</h2>
        <p className="text-center contact-form-description mb-4">
          اگر سوالی دارید یا نیاز به اطلاعات بیشتری دارید، لطفاً از طریق فرم زیر با ما تماس بگیرید.
        </p>

        
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: "", type: "" })} // بستن نوتیفیکیشن
          />
        )}

        <form className="contact-form row g-3 justify-content-center" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <input
              type="text"
              className="form-control contact-input"
              placeholder="نام شما"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <input
              type="email"
              className="form-control contact-input"
              placeholder="ایمیل شما"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-12">
            <input
              type="text"
              className="form-control contact-input"
              placeholder="موضوع پیام"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="col-md-12">
            <textarea
              className="form-control contact-textarea"
              rows="5"
              placeholder="پیام شما"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="col-md-12 text-center">
            <button type="submit" className="btn contact-submit-btn mt-4">
              ارسال پیام
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;