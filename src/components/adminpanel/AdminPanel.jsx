// src/components/adminpanel/AdminPanel.jsx
import React, { useState } from "react";
import { FaUserGraduate, FaBook, FaChartLine , FaSearch, FaHome} from "react-icons/fa"; 


import "../../assets/css/administrator.css"; 
import StudentManagement from "./StudentManagement";
import CourseManagement from "./CourseManagement";
import Reports from "./Reports";
import ViewMessages  from "./ViewMessages";
import AllCourseHistories from "./AllCourseHistories";
import AdminHomePage from "./AdminHomePage";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("admin-home");

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
      <button
          className={`sidebar-btn ${activeTab === "admin-home" ? "active" : ""}`}
          onClick={() => setActiveTab("admin-home")}
        >
          <FaHome className="sidebar-icon  m-2" />
            خانه
        </button>
        <button
          className={`sidebar-btn ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          <FaUserGraduate className="sidebar-icon m-2" />
          مدیریت دانشجویان
        </button>

        <button
          className={`sidebar-btn ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          <FaBook className="sidebar-icon  m-2" />
          مدیریت درس‌ها
        </button>

        <button
          className={`sidebar-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <FaChartLine className="sidebar-icon  m-2" />
          گزارش‌گیری
        </button>


        <button
          className={`sidebar-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <FaSearch className="sidebar-icon  m-2" />
          تاریخچه دروس دانشجویان
        </button>

        <button
          className={`sidebar-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          <FaChartLine className="sidebar-icon  m-2" />
          پیام های دانشجویان
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "admin-home" && <AdminHomePage />} 
        {activeTab === "students" && <StudentManagement />}
        {activeTab === "courses" && <CourseManagement />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "messages" && <ViewMessages/>}
        {activeTab === "history" && <AllCourseHistories/>}
      </div>
    </div>
  );
};

export default AdminPanel;
