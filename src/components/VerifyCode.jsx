import React, { useState, useRef, useEffect } from "react";
import "../assets/css/verifycode.css"; 

const VerifyCode = () => {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);


  const handleChange = (value, index) => {
    // فقط اعداد را نگه می‌داریم
    let val = value.replace(/[^0-9]/g, "");

    // اگر هیچ مقداری نباشد، فقط خالی می‌کنیم
    if (!val) {
      updateDigits("", index);
      return;
    }

    // اگر بیش از یک عدد تایپ یا پیست شد، به صورت تدریجی در اینپوت‌های بعدی پخش می‌کنیم
    if (val.length > 1) {
      const newDigits = [...digits];
      let currentIndex = index;

      for (let i = 0; i < val.length && currentIndex < 4; i++) {
        newDigits[currentIndex] = val[i];
        currentIndex++;
      }

      setDigits(newDigits);

      // اگر هنوز فیلدی باقی مانده، فوکوس روی اولین فیلد خالی بعد از تکمیل
      if (currentIndex <= 3) {
        inputsRef.current[currentIndex].focus();
      }
      // در غیر این صورت آخرین فیلد را فوکوس بدهید
      else {
        inputsRef.current[3].focus();
      }
    } else {
      // اگر یک کاراکتر (یک عدد) وارد شد
      updateDigits(val, index);
    }
  };

  // آپدیت فیلد جاری و فوکوس دهی به فیلد بعدی
  const updateDigits = (newValue, index) => {
    const newDigits = [...digits];
    newDigits[index] = newValue;
    setDigits(newDigits);

    // اگر مقدار وارد شد، فوکوس برود روی فیلد بعدی
    if (newValue && index < 3) {
      inputsRef.current[index + 1].focus();
    }
  };


  const handleKeyDown = (e, index) => {
    // اگر Backspace زده شد و فیلد فعلی خالی است، برو به فیلد قبلی
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

 
  const handleResendCode = () => {
    setTimer(60);
    console.log("Resending code...");
  };

  // کم کردن تایمر در هر ثانیه
  useEffect(() => {
    let intervalId;
    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [timer]);

  // کلیک روی دکمهٔ تأیید
  const handleConfirm = () => {
    const code = digits.join("");
    console.log("Verification Code: ", code);
    // منطق بررسی کد یا ارسال به سرور ...
  };

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h2 className="verify-title">کد تأیید</h2>
        <p className="verify-subtitle">
          یک کد ۴ رقمی به ایمیل شما ارسال شده است. لطفاً در کادرهای زیر وارد کنید:
        </p>

        <div className="input-fields">
          {digits.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="4" // این را 4 بگذارید تا اگر کاربر پیست کرد، بتواند چند رقم پشت سر هم درج کند
              value={digit}
              className="verify-input"
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <button className="verify-button" onClick={handleConfirm}>
          تأیید
        </button>

        <div className="resend-section">
          {timer > 0 ? (
            <p className="resend-text">
              کد را دریافت نکردید؟ می‌توانید پس از
              <span className="timer"> {timer < 10 ? `۰${timer}` : timer} </span>
              ثانیه دوباره درخواست دهید.
            </p>
          ) : (
            <button className="resend-button" onClick={handleResendCode}>
              ارسال مجدد کد
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
