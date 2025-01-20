// SignupForm.jsx
import React, { useState } from "react";
import { FaCloud, FaEye, FaEyeSlash,FaUserGraduate} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import Pic1 from "../assets/pics/Component 1.png";
import Pic2 from "../assets/pics/Component 2.png";
import Notification from "./adminpanel/Notification";


function SignupForm() {
  const [studentNumber, setStudentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentNumber || !email || !password || !confirmPassword) {
      setError("لطفاً تمامی فیلدها را پر کنید.");
      return;
    }
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        username: studentNumber,
        email: email,
        password: password,
        password1: confirmPassword,
      });

      console.log("ثبت‌نام با موفقیت انجام شد:", res);
      setSuccessMessage("ثبت نام شما با موفقیت انجام شد. لطفا صبر کنید تا به صفحه ورود هدایت شوید");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        setError("اطلاعات وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.");
      } else {
        setError("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container whole_page">
      {successMessage && (
        <Notification
          message={successMessage}
          type="success"
          onClose={() => {
            setSuccessMessage(null);
            navigate("/login");
          }}
        />
      )}

      <img src={Pic1} alt="تصویر شماره 1" className="pic pic1" />
      <div className="login-form">
        <form className="form1" onSubmit={handleSubmit}>
          <h2 className="text-center vorood-txt">ثبت نام</h2>

          <div className="form-group">
            <input
              type="text"
              className="form-control mt-2 mb-2"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder=" "
              maxLength="10"
              pattern="\d{10}"
              title="شماره دانشجویی باید ده رقم باشد"
              required
            />
            <label htmlFor="student-number" className="student-or-admin"><FaUserGraduate className="label-icon" />شماره دانشجویی</label>
          </div>

          <div className="form-group">
            <input
              type="email"
              className="form-control mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="email" className="student-or-admin"><FaCloud className="label-icon" />ایمیل</label>
          </div>

          <div className="form-group password-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pass1 mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                pattern=".{8,}"
                title="رمز عبور باید حداقل ۸ کاراکتر باشد."
                placeholder=" "
                required
              />
              <label htmlFor="password" className="ms-2">
                رمز عبور
              </label>
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash/> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group password-group">
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control mt-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder=" "
                required
              />
              <label htmlFor="confirm-password" className="ms-2">
                تایید رمز عبور
              </label>
              <span
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <p className="error_message">{error}</p>}

          <button
            type="submit"
            className="btn btn1 w-100 mb-2"
            disabled={isLoading}
          >
            {isLoading ? "در حال ثبت‌نام..." : "ثبت نام"}
          </button>
        </form>
      </div>
      <img src={Pic2} alt="تصویر شماره 2" className="pic pic2" />
    </div>
  );
}

export default SignupForm;
