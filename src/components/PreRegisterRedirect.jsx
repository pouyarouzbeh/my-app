import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function PreRegisterRedirect() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isLoggedIn) {
      navigate("/login"); // هدایت به صفحه ورود در صورت عدم ورود
    } else {
      navigate("/pre-register"); // هدایت به صفحه پیش ثبت‌نام در صورت ورود
    }
  }, [user.isLoggedIn, navigate]);

  return null; // هیچ محتوایی نشان نمی‌دهد
}

export default PreRegisterRedirect;
