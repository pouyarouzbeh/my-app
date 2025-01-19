import React, { useState } from "react";
import { postContact } from "../utils/api"; // متد API برای ارسال پیام
import "../assets/css/home.css"; // فایل CSS فرم تماس

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(""); // پیام وضعیت
  const [isSuccess, setIsSuccess] = useState(false); // وضعیت موفقیت یا خطا
  const [showMessage, setShowMessage] = useState(false); // نمایش یا عدم نمایش پیام

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
      setStatusMessage("پیام شما با موفقیت ارسال شد.");
      setIsSuccess(true);

      // پاک کردن فیلدهای فرم
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setStatusMessage("ارسال پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
      setIsSuccess(false);
      console.error("Error sending contact message:", error);
    }

    // نمایش پیام برای مدت مشخص و سپس حذف
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000); // پیام پس از ۳ ثانیه محو می‌شود
  };

  return (
    <div className="contact-form-section py-5">
      <div className="container">
        <h2 className="mb-5">تماس با ما</h2>
        <p className="text-center contact-form-description mb-4">
          اگر سوالی دارید یا نیاز به اطلاعات بیشتری دارید، لطفاً از طریق فرم زیر با ما تماس بگیرید.
        </p>

        {/* پیام وضعیت */}
        {showMessage && (
          <div
            className={`alert ${
              isSuccess ? "alert-success" : "alert-danger"
            } text-center`}
          >
            {statusMessage}
          </div>
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
