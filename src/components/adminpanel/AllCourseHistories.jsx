import React, { useState, useEffect, useCallback } from "react";
import "../../assets/css/administrator.css";
import { getCourseHistory, importCourseHistory } from "../../utils/api";
import Notification from "./Notification"; 
import {
  InputGroup,
  FormControl,
  Spinner,
  Card,
  Row,
  Col,
  Button,
  Form,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

const AllCourseHistories = () => {
  const [courseHistory, setCourseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState(null);

  // state مخصوص پیام‌ها
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });


  const fetchCourseHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCourseHistory();
      // فرض می‌کنیم در پاسخ data.results وجود دارد
      const historyData = response?.data?.results || [];

      const sortedData = historyData.sort((a, b) =>
        a.username.localeCompare(b.username)
      );
      setCourseHistory(sortedData);
    } catch (err) {
      console.error("Error fetching course history:", err);
      setNotification({
        message: "خطا در دریافت تاریخچه دروس.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // اجرا فقط یک‌بار هنگام mount کامپوننت
  useEffect(() => {
    fetchCourseHistory();
  }, [fetchCourseHistory]);

  // گروه‌بندی courseHistory بر اساس username
  const groupedHistory = courseHistory.reduce((acc, course) => {
    if (!acc[course.username]) {
      acc[course.username] = [];
    }
    acc[course.username].push(course);
    return acc;
  }, {});

  // فیلتر گروه‌بندی بر اساس عبارت جستجو
  const filteredGroupedHistory = Object.keys(groupedHistory)
    .filter((username) =>
      username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .reduce((acc, username) => {
      acc[username] = groupedHistory[username];
      return acc;
    }, {});

  // توابع کمک‌کننده برای نمایش وضعیت درس
  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return <span style={{ color: "green" }}>پاس شده</span>;
      case "failed":
        return <span style={{ color: "red" }}>افتاده</span>;
      case "in_progress":
        return <span style={{ color: "orange" }}>در حال انجام</span>;
      default:
        return <span>{status}</span>;
    }
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setNotification({
        message: "لطفاً یک فایل انتخاب کنید.",
        type: "error",
      });
      setFile(null);
      return;
    }


    const maxSize = 8 * 1024 * 1024; // 8MB
    if (selectedFile.size > maxSize) {
      setNotification({
        message: "حجم فایل بیش از حد مجاز است.",
        type: "error",
      });
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // آپلود و ایمپورت فایل در سرور
  const handleFileUpload = async () => {
    if (!file) {
      setNotification({
        message: "لطفاً یک فایل انتخاب کنید.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // کلید "file" با بک‌اند هماهنگ شود

    try {
      setLoading(true);
      const response = await importCourseHistory(formData);
      // اگر بک‌اند با کلید message پاسخ نمی‌دهد، ادیت کنید
      // یا از response.data.details استفاده کنید
      let successMessage = response?.data?.details || "فایل با موفقیت ایمپورت شد.";
      setNotification({
        message: successMessage,
        type: "success",
      });
      setFile(null);


      await fetchCourseHistory();
    } catch (err) {
      console.error("Error importing course history:", err);
      // ساخت پیام خطا
      let errorMessage = "خطا در ایمپورت فایل.";
      if (err.response && err.response.data) {

        if (err.response.data.details) {
          errorMessage = err.response.data.details;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      setNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-history-container">
      <h2 className="text-center mb-4">تاریخچه دروس</h2>


      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />
      )}

      {/* آپلود فایل اکسل */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <Card style={{ width: "25rem" }}>
          <Card.Body>
            <Form>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>انتخاب فایل اکسل</Form.Label>
                <Form.Control
                  type="file"
                  size="sm"
                  onChange={handleFileChange}
                  accept=".xls, .xlsx"
                />
              </Form.Group>
              <div className="d-flex justify-content-center">
                <Button
                  size="sm"
                  onClick={handleFileUpload}
                  disabled={loading || !file}
                >
                  آپلود فایل
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <InputGroup className="my-3 col-md-6 mx-auto">
        <FormControl
          placeholder="جستجو بر اساس نام کاربری"
          className="input_placeholder1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline-secondary" size="sm">
          <FaSearch />
        </Button>
      </InputGroup>


      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      ) : Object.keys(filteredGroupedHistory).length === 0 ? (
        <p className="text-center">هیچ تاریخچه‌ای یافت نشد.</p>
      ) : (
        <Row className="gy-3">
          {Object.entries(filteredGroupedHistory).map(([username, courses]) => (
            <Col md={6} lg={4} key={username}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>
                    <strong>دانشجو:</strong> {username}
                  </Card.Title>
                  <Card.Text>
                    <ul>
                      {courses.map((course) => (
                        <li key={course.id} className="mb-3">
                          <strong>درس:</strong> {course.course} <br />
                          <strong>نمره:</strong> {course.grade} <br />
                          <strong>وضعیت:</strong>{" "}
                          {getStatusLabel(course.status)}
                        </li>
                      ))}
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AllCourseHistories;
