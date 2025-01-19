import React from "react";
import Slider from "react-slick";
import "../assets/css/home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HeroImage from "../assets/pics/ce2.png";
import HeroImage2 from "../assets/pics/ce3.png";

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    rtl: true, // برای زبان فارسی
    arrows: false, // غیرفعال کردن فلش‌های چپ و راست
  };

  return (
    <Slider {...settings} className="hero-slider">
      <div
        className="hero-slide"
        style={{ backgroundImage: `url(${HeroImage})` }}
      >
        <div className="hero-content text-center">
          <h1 className="display-6">به دانشگاه شهید رجایی خوش آمدید</h1>
          <p className="lead">پیش ثبت نام برای ترم تحصیلی جدید را آغاز کنید.</p>
          <a href="#pre-register" className="btn btn-light btn-lg">
            پیش ثبت نام
          </a>
        </div>
      </div>
      <div
        className="hero-slide"
        style={{ backgroundImage: `url(${HeroImage2})` }}
      >
        <div className="hero-content text-center">
          <h1 className="display-6">آماده برای آینده‌ای روشن</h1>
          <p className="lead">دانشگاه ما شما را برای موفقیت آماده می‌کند.</p>
          <a href="#about" className="btn btn-light btn-lg">
            درباره ما بیشتر بدانید
          </a>
        </div>
      </div>
    </Slider>
  );
};

export default HeroSlider;
