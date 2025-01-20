// src/components/Home.jsx

import React, { useEffect, useRef, useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import ContactForm from "./ContactForm";
import "../assets/css/common.css";
import "../assets/css/home.css";
import HeroImage from "../assets/pics/ce3.png";
import U1 from "../assets/pics/u1.jpg";
import U2 from "../assets/pics/u2.jpg";
import U3 from "../assets/pics/u3.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faTelegram, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from 'react-router-dom';
import { getProfileById } from "../utils/api"; 
import { Spinner } from "react-bootstrap";
import Notification from "./adminpanel/Notification"; // وارد کردن Notification

const Home = () => {
  const imageRefs = useRef([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(""); // وضعیت برای پیام موفقیت

  useEffect(() => {
    const currentRefs = imageRefs.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("img-visible");
          }
        });
      },
      { threshold: 0.5 }
    );

    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handlePreRegisterClick = async () => {
    if (!user.isLoggedIn) {
      navigate("/login");
      return;
    }

    setCheckingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await getProfileById(user.id);
      const profile = response.data;

      const isProfileComplete =
        profile.first_name &&
        profile.last_name &&
        profile.phone_number &&
        profile.email &&
        profile.username;

      if (isProfileComplete) {
        setProfileSuccess("پروفایل شما کامل است و می‌توانید پیش ثبت نام کنید.");
        // نمایش نوتیفیکیشن موفقیت
        // در اینجا ممکن است بخواهید نوتیفیکیشن نمایش داده شود قبل از هدایت
        // ولی در کد فعلی، نوتیفیکیشن نمایش داده می‌شود ولی بعد از 2 ثانیه به صفحه اصلی هدایت می‌شوید
        navigate("/pre-register");
      } else {
        navigate("/edit-profile", { state: { message: "لطفاً اطلاعات پروفایل خود را کامل کنید." } });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError(error.response?.data?.message || "خطا در بررسی پروفایل.");
    } finally {
      setCheckingProfile(false);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header
        id="home"
        className="hero d-flex align-items-center justify-content-center text-center py-5"
        style={{ backgroundImage: `url(${HeroImage})` }}
      >
        <div className="hero-content" id="register">
          <h1 className="hero-title">به دانشگاه شهید رجایی خوش آمدید</h1>
          <p className="lead">
            پیش ثبت نام برای ترم تحصیلی جدید را آغاز کنید.
          </p>
          <button
            onClick={handlePreRegisterClick}
            className="btn btn-light btn-lg"
            disabled={checkingProfile} // غیرفعال کردن دکمه هنگام بررسی
          >
            {checkingProfile ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                در حال بررسی...
              </>
            ) : (
              "پیش ثبت نام"
            )}
          </button>
        </div>
      </header>

      {/* نمایش پیام‌های خطا و موفقیت */}
      {profileError && (
        <Notification
          message={profileError}
          type="error"
          onClose={() => setProfileError("")}
          uniqueClass="home-error-notification"
        />
      )}
      {profileSuccess && (
        <Notification
          message={profileSuccess}
          type="success"
          onClose={() => setProfileSuccess("")}
          uniqueClass="home-success-notification"
        />
      )}

      {/* About Section */}
      <section id="about" className="py-5">
        <div className="container">
          <h2 className="about_us_text text-center mb-3">درباره ما</h2>
          <p className="lead">
            دانشگاه شهید رجایی یکی از برترین مراکز آموزشی کشور است که با ارائه برنامه‌های آموزشی متنوع و با کیفیت، دانشجویان را برای موفقیت در آینده آماده می‌کند.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-5 text-center">
        <div className="container col-md-8">
          <h2 className="mb-5">خدمات ما</h2>
          <div className="row">
            {[U1, U2, U3].map((image, index) => (
              <div className="col-md-4" key={index}>
                <div className="card p-3">
                  <img
                    ref={(el) => (imageRefs.current[index] = el)}
                    src={image}
                    alt={`Service ${index + 1}`}
                    className="card-img-top img-animate"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {index === 0
                        ? "برنامه‌های آموزشی"
                        : index === 1
                        ? "اساتید مجرب"
                        : "محیط آموزشی مدرن"}
                    </h5>
                    <p className="card-text">
                      {index === 0
                        ? "ارائه دوره‌های مختلف کارشناسی، ارشد و دکتری."
                        : index === 1
                        ? "استفاده از بهترین اساتید برای انتقال دانش به روز."
                        : "مجهز به تجهیزات آموزشی پیشرفته برای یادگیری بهتر."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact1 text-center" id="contact">
        <div className="row justify-content-center">
          <ContactForm />
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer text-center">
        <div className="container container2 mt-4 col-md-7">
          <div className="row justify-content-between g-4">
            <div className="col-md-3 box1">
              <h5 className="mb-4">درباره ما</h5>
              <p className="mb-4">
                دانشگاه شهید رجایی با سابقه‌ای درخشان در ارائه آموزش‌های تخصصی و عمومی، به دانشجویان عزیز خدمات آموزشی باکیفیت ارائه می‌دهد.
              </p>
            </div>
            <div className="col-md-3 box2">
              <h5>لینک‌های مهم</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#home">خانه</a>
                </li>
                <li>
                  <a href="#about">درباره ما</a>
                </li>
                <li>
                  <a href="#register">پیش ثبت نام</a>
                </li>
                <li className="mb-4">
                  <a href="#contact">تماس با ما</a>
                </li>
              </ul>
            </div>

            <div className="col-md-3 box3">
              <h5>اطلاعات تماس</h5>
              <ul className="list-unstyled">
                <li>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> تهران لویزان خیابان شعبانلو دانشگاه شهید رجایی
                </li>
                <li>
                  <FontAwesomeIcon icon={faPhone} /> تلفن : 9-02122970060 
                </li>
                <li className="mb-5">
                  <FontAwesomeIcon icon={faEnvelope} /> ایمیل: sru@sru.ac.ir
                </li>
              </ul>
            </div>

            <div className="col-md-3 box4">
              <h5>شبکه های اجتماعی</h5>
              <ul className="list-inline">
                <li className="list-inline-item">
                  <a href="https://t.me/" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faTelegram} />
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
