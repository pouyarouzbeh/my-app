import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "./components/context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Signup from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import Forget from "./components/Forget";
import Verify from "./components/Verify";
import RegistrationForm from "./components/RegisterationForm";
import AdminPanel from "./components/adminpanel/AdminPanel";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
// import VerifyCode from "./components/VerifyCode";
import ChangePassword from "./components/ChangePassword";
import ActivationPage from "./components/ActivationPage";
import VerifyAccount from "./components/VerifyAccount";
import ResendActivationPage from "./components/ResendActivationPage";


// Routeهای محافظت‌شده
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

function AppContent() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div>در حال بارگذاری...</div>; // یا یک اسپینر زیباتر
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* مسیرهای آزاد */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/accounts/api/v1/activation/confirm/<token/" element={<ActivationPage />} />
        <Route path="/activation-resend" element={<ResendActivationPage />} />
        <Route path="/verify-account" element={<VerifyAccount />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/verify" element={<Verify />} />
        {/* مسیر پیش‌ثبت‌نام فقط درصورتی که کاربر لاگین کرده باشد */}
        <Route path="/pre-register" element={<PrivateRoute />}>
          <Route index element={<RegistrationForm />} />
        </Route>

        {/* مسیر پروفایل هم فقط لاگین‌شده‌ها ببینند (اختیاری) */}
        <Route path="/profile" element={<PrivateRoute />}>
          <Route index element={<Profile />} />
        </Route>
        
        <Route path="/edit-profile" element={<PrivateRoute />}>
          <Route index element={<EditProfile />} />
        </Route>
        <Route path="/change_password" element={<PrivateRoute />}>
          <Route index element={<ChangePassword />} />
        </Route>

        {/* مسیر ادمین مخصوص ادمین‌ها */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminPanel />} />
        </Route>

        
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
