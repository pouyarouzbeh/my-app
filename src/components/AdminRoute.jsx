import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import {AuthContext } from "./context/AuthContext";

function AdminRoute() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  // if (!user.is_admin) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}

export default AdminRoute;
