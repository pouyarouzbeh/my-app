import React, { useState, useEffect, useMemo } from "react";
import {
  getUsers,
  getAllProfiles,
  getRegistrations,
  getReportCourses,
  postReportCourses
} from "../../utils/api";
import { FaUsers, FaRegListAlt, FaSearch, FaDownload, FaEye } from "react-icons/fa";
import Notification from "./Notification"; // کامپوننت دلخواه جهت نمایش ارور/هشدار
import { InputGroup, FormControl, Spinner, Card, Table, Button } from "react-bootstrap";
import "../../assets/css/administrator.css";
import { downloadFile } from "../../utils/downloadFile";

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  // گزارش دریافت‌شده (JSON) برای نمایش روی صفحه
  const [reportData, setReportData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  // استخراج ترم‌های منحصربه‌فرد از ثبت‌نام‌ها
  const terms = useMemo(() => {
    return [...new Set(registrations.map((r) => r.term))];
  }, [registrations]);

  // ابتدا لیست کاربران، پروفایل‌ها و ثبت‌نام‌ها (دموی کلی)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, profilesResponse, registrationsResponse] = await Promise.all([
          getUsers(),
          getAllProfiles(),
          getRegistrations(),
        ]);

        const users = usersResponse?.data?.results || [];
        const profiles = profilesResponse?.data?.results || [];
        const registrationsData = registrationsResponse?.data?.results || [];

        // ادغام اطلاعات کاربر و پروفایل
        const mergedData = users.map((user) => {
          const profile = profiles.find((p) => p.username === user.username);
          return {
            ...user,
            first_name: profile?.first_name || "نام",
            last_name: profile?.last_name || "نام‌خانوادگی",
            phone_number: profile?.phone_number || "",
            student_number: user.student_number || "",
          };
        });

        setStudents(mergedData);
        setRegistrations(registrationsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("خطا در دریافت داده‌ها.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // دریافت گزارش به صورت JSON و نمایش در صفحه (متد GET)
  const handleGetReportData = async () => {
    if (!selectedTerm) {
      setError("لطفاً ترم مورد نظر را انتخاب کنید.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await getReportCourses(selectedTerm);
      if (response?.data) {
        setReportData(response.data);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("خطا در دریافت گزارش ترم.");
    } finally {
      setLoading(false);
    }
  };

  // دانلود فایل گزارش با فرمت دلخواه (متد POST با Blob)
  const handleDownloadReport = async (format) => {
    if (!selectedTerm) {
      setError("لطفاً ترم مورد نظر را انتخاب کنید.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await postReportCourses(selectedTerm, format);
      if (!response || !response.data) {
        setError("فایلی برای دانلود موجود نیست.");
        return;
      }
      // نام فایل خروجی
      const filename = `report_term_${selectedTerm}.${format}`;
      // تابع کمکی برای ذخیره فایل
      downloadFile(response.data, filename);
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("خطا در دانلود گزارش.");
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کردن ثبت‌نام‌ها بر اساس جستجوی نام دانشجو، شماره دانشجویی یا نام کاربری
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const query = searchQuery.toLowerCase();

    return registrations.filter((registration) => {
      const identifier = registration.user?.toLowerCase();
      if (!identifier) return false;

      const student = students.find((s) => s.username.toLowerCase() === identifier);
      if (!student) return false;

      const { username, student_number, first_name, last_name } = student;
      const fullName = `${first_name} ${last_name}`.toLowerCase();

      return (
        (username && username.toLowerCase().includes(query)) ||
        (student_number && student_number.toLowerCase().includes(query)) ||
        fullName.includes(query)
      );
    });
  }, [registrations, searchQuery, students]);

  return (
    <div className="container reports-container">
      <h2 className="my-4 text-center">گزارش‌گیری ادمین</h2>

      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">انتخاب ترم</h5>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="form-select mt-2"
              >
                <option value="">انتخاب کنید</option>
                {terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>

              <div className="mt-3 d-flex flex-wrap gap-2">
                {/* دکمه مشاهده گزارش به‌صورت JSON روی صفحه */}
                <Button
                  variant="primary"
                  onClick={handleGetReportData}
                  disabled={!selectedTerm}
                >
                  <FaEye className="me-2" />
                  مشاهده گزارش
                </Button>

                {/* دکمه‌های دانلود گزارش در فرمت‌های مختلف */}
                <Button
                  variant="success"
                  onClick={() => handleDownloadReport("xlsx")}
                  disabled={!selectedTerm}
                >
                  <FaDownload className="me-2" />
                  دانلود اکسل
                </Button>

              </div>
            </Card.Body>
          </Card>

          {/* نمایش گزارش دریافتی از متد GET */}
          {reportData && reportData.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">گزارش ترم {selectedTerm}</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Term</th>
                      <th>Course Name</th>
                      <th>Total Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr key={index}>
                        <td>{item["Term"]}</td>
                        <td>{item["Course Name"]}</td>
                        <td>{item["Total Requests"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* خلاصه‌ای از وضعیت کلی کاربران و ثبت‌نام‌ها (مثال دلخواه) */}
          <div className="reports-summary d-flex justify-content-around mb-4 flex-wrap">
            <div className="report-item text-center">
              <FaUsers size={40} color="#4caf50" />
              <h6 className="mt-2">تعداد دانشجویان</h6>
              <h6 className="mx-2 mt-2">{students.length} نفر</h6>
            </div>
            <div className="report-item text-center">
              <FaRegListAlt size={40} color="#673ab7" />
              <h6 className="mt-2">تعداد پیش‌ثبت‌نام‌ها</h6>
              <h6 className="mx-2 mt-2">{registrations.length} پیش‌ثبت‌نام</h6>
            </div>
          </div>

          {/* جدول ثبت‌نام‌ها با قابلیت جستجو */}
          <Card>
            <Card.Body>
              <InputGroup className="mb-3 mt-4">
                <FormControl
                  placeholder="جستجو بر اساس شماره دانشجویی یا نام دانشجو"
                  value={searchQuery}
                  className="input_placeholder1"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
              </InputGroup>

              {filteredRegistrations.length === 0 ? (
                <div className="text-center">
                  <p>هیچ پیش‌ثبت‌نامی مطابق با معیار جستجو وجود ندارد.</p>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>نام دانشجو</th>
                      <th>نام کاربری</th>
                      <th>دروس ثبت‌شده</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => {
                      const student = students.find(
                        (s) => s.username.toLowerCase() === reg.user.toLowerCase()
                      );
                      const { first_name = "نام", last_name = "نام‌خانوادگی" } = student || {};
                      const fullName = `${first_name} ${last_name}`;
                      const coursesList = Array.isArray(reg.courses_id)
                        ? reg.courses_id.join(", ")
                        : "بدون درس ثبت‌شده";

                      return (
                        <tr key={reg.id}>
                          <td>{fullName}</td>
                          <td>{reg.user}</td>
                          <td>{coursesList}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
