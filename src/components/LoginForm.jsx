import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../assets/css/common.css";
import "../assets/css/signup.css";

import Pic1 from "../assets/pics/Component 1.png";
import Pic2 from "../assets/pics/Component 2.png";

// توابع API
import { loginUser, getProfileById } from "../utils/api";

// AuthContext
import { AuthContext } from "./context/AuthContext";

function LoginForm() {
  const { login, updateUser } = useContext(AuthContext);

  const [userType, setUserType] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateInputs = () => {
    if (!username || !password) {
      setError("لطفاً تمامی اطلاعات را تکمیل کنید!");
      return false;
    }
    if (userType === "student" && !/^\d{10}$/.test(username)) {
      setError("شماره دانشجویی باید ده رقم باشد.");
      return false;
    }
    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return false;
    }
    return true;
  };

  const handleTabChange = (type) => {
    setUserType(type);
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      // فراخوانی تابع loginUser برای ورود
      const { data: logindata } = await loginUser({ username, password });
      console.log("Login response:", logindata);

      // بررسی نوع کاربر ادمین
      if (userType === "admin" && !logindata.is_admin) {
        setError("شما ادمین نیستید!");
        setIsLoading(false);
        return;
      }

      // فراخوانی تابع login از AuthContext با داده‌های دریافت شده
      login({
        token: logindata.token,
        user_id: logindata.user_id,
        username: logindata.username,
        email: logindata.email,
        is_admin: logindata.is_admin,
        is_active: logindata.is_active,
        is_verified: logindata.is_verified,
      });

      // دریافت اطلاعات پروفایل کاربر با استفاده از user_id
      const { data: profileData } = await getProfileById(logindata.user_id);
      console.log("Profile data:", profileData);

      // به‌روزرسانی اطلاعات کاربر در AuthContext
      updateUser({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        max_units: profileData.max_units,
        last_average: profileData.last_average,
        phone_number: profileData.phone_number,
        is_last_semester: profileData.is_last_semester,
      });

      // بررسی کامل بودن اطلاعات پروفایل
      const isProfileComplete =
        profileData.first_name &&
        profileData.last_name &&
        profileData.phone_number &&
        profileData.max_units !== null &&
        profileData.max_units !== undefined;

      if (!isProfileComplete && !logindata.is_admin) {
        navigate("/edit-profile");
      } else {
        // هدایت به صفحه مناسب بر اساس نوع کاربر
        navigate(logindata.is_admin ? "/admin" : "/pre-register");
      }
    } catch (error) {
      let errorMessage = "خطا در ورود. لطفاً دوباره تلاش کنید.";

      // مدیریت خطاهای مختلف
      if (error.response) {
        const { data, status } = error.response;
        if (data && typeof data === "object") {
          if (data.detail) {
            if (data.detail === "Unable to log in with provided credentials.") {
              errorMessage = "نام کاربری یا رمز عبور اشتباه است.";
            } else {
              errorMessage = translateToPersian(data.detail);
            }
          } else if (data.non_field_errors) {
            const combined = data.non_field_errors.join(" ");
            if (combined.includes("Unable to log in")) {
              errorMessage = "نام کاربری یا رمز عبور اشتباه است.";
            } else {
              errorMessage = combined;
            }
          } else {
            errorMessage = Object.keys(data)
              .map((key) => {
                const val = data[key];
                if (Array.isArray(val)) {
                  return val.join(" ");
                }
                return val;
              })
              .join(" ");
            errorMessage = translateToPersian(errorMessage);
          }
        } else {
          if (status === 401) {
            errorMessage = "نام کاربری یا رمز عبور اشتباه است.";
          } else if (status === 403) {
            errorMessage = "شما اجازه دسترسی به این بخش را ندارید.";
          }
        }
      } else {
        errorMessage = "ارتباط با سرور برقرار نشد. لطفاً بعداً تلاش کنید.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const translateToPersian = (msg) => {
    let persianMsg = msg;
    const translations = {
      "Unable to log in with provided credentials.":
        "نام کاربری یا رمز عبور اشتباه است.",
      "This field may not be blank.": "این فیلد نمی‌تواند خالی باشد.",
      "username": "نام کاربری",
      "password": "رمز عبور",
    };

    Object.keys(translations).forEach((key) => {
      if (persianMsg.includes(key)) {
        persianMsg = persianMsg.replace(key, translations[key]);
      }
    });

    return persianMsg;
  };

  return (
    <div className="container whole_page">
      <img src={Pic1} alt="تصویر شماره 1" className="pic pic1" />

      <div className="login-form">
        <div className="tabs">
          <button
            className={`tab-btn ${userType === "student" ? "active" : ""}`}
            onClick={() => handleTabChange("student")}
          >
            ورود دانشجو
          </button>
          <button
            className={`tab-btn ${userType === "admin" ? "active" : ""}`}
            onClick={() => handleTabChange("admin")}
          >
            ورود ادمین
          </button>
        </div>

        <form className="form1" onSubmit={handleSubmit}>
          <h2 className="text-center vorood-txt">
            {userType === "student" ? "ورود دانشجو" : "ورود ادمین"}
          </h2>

          <div className="form-group">
            <input
              type="text"
              className="form-control mt-2 mb-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=" "
              required
            />
            <label>
              {userType === "student"
                ? "شماره دانشجویی"
                : "نام کاربری ادمین"}
            </label>
          </div>

          <div className="form-group password-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pass1 mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label className="ms-3">رمز عبور</label>
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <p className="error_message">{error}</p>}

          <button
            type="submit"
            className="btn btn1 w-100 mb-2 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "در حال ورود..." : "ورود"}
          </button>

          {userType === "student" && (
            <div className="text-center mt-2">
              <p className="mb-1">
                حساب ندارید؟ <Link to="/signup">ثبت‌نام</Link>
              </p>
              <p>
              <a href="http://localhost:8000/accounts/api/v1/password_reset/">فراموشی رمز عبور</a>
              </p>
            </div>
          )}
        </form>
      </div>
      <img src={Pic2} alt="تصویر شماره 2" className="pic pic2" />
    </div>
  );
}

export default LoginForm;
