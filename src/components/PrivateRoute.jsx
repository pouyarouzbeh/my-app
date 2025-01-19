import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function PrivateRoute() {
  const {loading } = useContext(AuthContext);

  if (loading) {
    return <div>در حال بارگذاری...</div>; // می‌توانید یک اسپینر زیباتر استفاده کنید
  }

  // if (!user.isLoggedIn) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}

export default PrivateRoute;
