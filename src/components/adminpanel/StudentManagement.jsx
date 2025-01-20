// src/components/StudentManagement.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import "../../assets/css/administrator.css";
import {
  getUsers,
  getAllProfiles,
  postUser,
  updateUserById,
  deleteUserById
} from "../../utils/api";

import Notification from "./Notification";

import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa"; 
import { AuthContext } from "../../components/context/AuthContext"; 

const StudentManagement = () => {
  const [students, setStudents] = useState([]);  // فهرست کاربران + پروفایل
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State (برای به‌روزرسانی)
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [modalUsername, setModalUsername] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");

  // دو state جدید برای مدال حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // State for Search
  const [searchQuery, setSearchQuery] = useState("");

  // State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // مصرف AuthContext
  const { login } = useContext(AuthContext);

  // =========================================================================
  //  دریافت کاربران و پروفایل‌ها (Promise.all) و ادغام بر اساس username
  // =========================================================================
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("در حال دریافت کاربران و پروفایل‌ها...");
      const [usersRes, profilesRes] = await Promise.all([
        getUsers(),
        getAllProfiles()
      ]);

      console.log("پاسخ کاربران:", usersRes);
      console.log("پاسخ پروفایل‌ها:", profilesRes);

      const userList = Array.isArray(usersRes.data.results) ? usersRes.data.results : usersRes.data || [];
      const profileList = Array.isArray(profilesRes.data.results) ? profilesRes.data.results : profilesRes.data || [];

      console.log("لیست کاربران:", userList);
      console.log("لیست پروفایل‌ها:", profileList);

      const mergedData = userList.map((u) => {
        const foundProfile = profileList.find((p) => p.username === u.username);
        if (foundProfile) {
          return {
            ...u,
            profileId: foundProfile.id, 
            first_name: foundProfile.first_name || "",
            last_name: foundProfile.last_name || "",
            phone_number: foundProfile.phone_number || "",
            last_average: foundProfile.last_average || ""
            // هر فیلد دیگر...
          };
        }
        return { 
          ...u, 
          profileId: null, 
          first_name: "", 
          last_name: "", 
          phone_number: "", 
          last_average: "" 
        };
      });

      setStudents(mergedData);
      console.log("داده‌های ادغام شده دانشجویان:", mergedData);
    } catch (err) {
      console.error("Error fetching users or profiles:", err);
      setError(
        err.response?.data?.message || "خطا در دریافت اطلاعات کاربران/پروفایل."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // بار اول که کامپوننت mount می‌شود
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // =========================================================================
  //  افزودن دانشجو
  // =========================================================================
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.target;

    const newUser = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value, // دریافت پسورد
      confirmPassword: form.confirmPassword.value, // دریافت تأیید پسورد
      first_name: form.first_name?.value.trim() || "",
      last_name: form.last_name?.value.trim() || "",
      phone_number: form.phone_number?.value.trim() || ""
    };

    // بررسی تطابق پسورد و تأیید پسورد
    if (newUser.password !== newUser.confirmPassword) {
      setError("پسورد و تأیید پسورد با هم مطابقت ندارند.");
      setLoading(false);
      return;
    }

    // بررسی ورود پسورد و ایمیل
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("لطفاً شماره دانشجویی (username)، ایمیل و پسورد را وارد کنید.");
      setLoading(false);
      return;
    }

    try {
      console.log("در حال افزودن دانشجو جدید:", newUser);
      // ایجاد کاربر
      const userRes = await postUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone_number: newUser.phone_number
      });
      const createdUser = userRes.data;

      console.log("دانشجوی ایجاد شده:", createdUser);

      // به‌روزرسانی لیست دانشجویان
      setStudents(prev => [
        ...prev,
        {
          ...createdUser,
          profileId: null,
          first_name: "",
          last_name: "",
          phone_number: "",
          last_average: ""
        }
      ]);

      setSuccess("دانشجو با موفقیت افزوده شد.");

      // خالی کردن فرم
      form.reset();
      // همچنین مخفی کردن پسوردها بعد از افزودن
      setShowPassword(false);
      setShowConfirmPassword(false);

      // ورود خودکار کاربر جدید
      await login({ username: newUser.username, password: newUser.password });

    } catch (err) {
      console.error("خطا در افزودن دانشجو:", err);
      setError(err.response?.data?.message || "خطا در افزودن دانشجو.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  باز کردن Modal برای به‌روزرسانی دانشجو
  // =========================================================================
  const handleOpenUpdateModal = (student) => {
    setCurrentStudent(student);
    setModalUsername(student.username);
    setModalEmail(student.email);
    setModalPassword(student.password);
    setShowModal(true);
  };

  // =========================================================================
  //  بستن Modal
  // =========================================================================
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStudent(null);
    setModalUsername("");
    setModalEmail("");
    setModalPassword("");
    // Reset only the error message
    setError("");
    // Do NOT reset success here
  };

  // =========================================================================
  //  به‌روزرسانی اطلاعات کاربر از Modal
  // =========================================================================
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!currentStudent) return;

    setLoading(true);
    setError("");
    setSuccess("");

    const updatedUser = {
      username: modalUsername.trim(),
      email: modalEmail.trim(),
      password: modalPassword.trim()
    };

    if (!updatedUser.username || !updatedUser.email || !updatedUser.password) {
      setError("لطفاً شماره دانشجویی (username) و ایمیل را وارد کنید.");
      setLoading(false);
      return;
    }

    try {
      console.log("در حال به‌روزرسانی دانشجو:", updatedUser);
      const userRes = await updateUserById(currentStudent.username, updatedUser);
      const updatedData = userRes.data;

      console.log("دانشجوی به‌روزرسانی شده:", updatedData);

      setSuccess("دانشجو با موفقیت به‌روزرسانی شد.");

      setStudents(prev =>
        prev.map(stu =>
          stu.username === currentStudent.username
            ? {
                ...stu,
                username: updatedData.username,
                email: updatedData.email,
                password: updatedData.password
                // اگر نیاز به به‌روزرسانی سایر فیلدها بود، اضافه کنید
              }
            : stu
        )
      );

      // بستن Modal
      handleCloseModal();
    } catch (err) {
      console.error("خطا در به‌روزرسانی دانشجو:", err);
      setError(err.response?.data?.message || "خطا در به‌روزرسانی دانشجو.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  حذف کاربر با استفاده از مدال
  // =========================================================================
  const handleRemoveStudent = (stu) => {
    // این تابع فقط مدال را باز می‌کند و studentToDelete را ست می‌کند
    setStudentToDelete(stu);
    setShowDeleteModal(true);
  };

  // =========================================================================
  //  تایید حذف کاربر از مدال
  // =========================================================================
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("در حال حذف دانشجو:", studentToDelete.username);
      await deleteUserById(studentToDelete.username);
      setSuccess("دانشجو با موفقیت حذف شد.");

      // به‌روزرسانی لیست دانشجویان در state
      setStudents(prev => prev.filter(stu => stu.username !== studentToDelete.username));

      // بستن مدال حذف
      handleCloseDeleteModal();
    } catch (err) {
      console.error("خطا در حذف دانشجو:", err);
      setError(err.response?.data?.message || "خطا در حذف دانشجو.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  //  بستن مدال حذف
  // =========================================================================
  const handleCloseDeleteModal = () => {
    setStudentToDelete(null);
    setShowDeleteModal(false);
  };

  // =========================================================================
  //  رابط کاربری (رندر)
  // =========================================================================
  return (
    <div className="container management-container">
      <h2 className="my-4">مدیریت دانشجویان</h2>
  
      {/* اعلان خطا یا موفقیت */}
      {error && (
        <Notification
          message={error}
          type="error"
          onClose={() => setError("")}
        />
      )}
      {success && (
        <Notification
          message={success}
          type="success"
          onClose={() => setSuccess("")}
        />
      )}
      {loading && <p className="text-info">در حال بارگذاری...</p>}
  
      {/* فیلد جستجو با InputGroup و آیکون جستجو */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <InputGroup>
            <Form.Control
              type="text"
              className="form-control input_placeholder1"
              placeholder="جستجو بر اساس شماره دانشجویی"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
          </InputGroup>
        </div>
      </div>
  
      {/* فرم افزودن دانشجو */}
      <form onSubmit={handleAddStudent} className="row g-3 mb-4">
        <div className="col-sm-6 col-md-2">
          <input
            type="text"
            name="username"
            className="form-control input_placeholder1"
            placeholder="شماره دانشجویی"
            required
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <input
            type="email"
            name="email"
            className="form-control input_placeholder1"
            placeholder="ایمیل"
            required
          />
        </div>
  
        {/* فیلد پسورد با InputGroup */}
        <div className="col-sm-6 col-md-2">
          <InputGroup>
            <Form.Control
              type={showPassword ? "text" : "password"} // تغییر نوع ورودی بر اساس وضعیت
              name="password"
              className="input_placeholder1"
              placeholder="رمز عبور"
              required
            />
            <InputGroup.Text
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
              aria-label={showPassword ? "مخفی کردن پسورد" : "نمایش پسورد"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>
        </div>
  
        {/* فیلد تأیید پسورد با InputGroup */}
        <div className="col-sm-6 col-md-2">
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"} // تغییر نوع ورودی بر اساس وضعیت
              name="confirmPassword"
              className="input_placeholder1"
              placeholder="تأیید رمز عبور"
              required
            />
            <InputGroup.Text
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ cursor: "pointer" }}
              aria-label={showConfirmPassword ? "مخفی کردن پسورد" : "نمایش پسورد"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </InputGroup.Text>
          </InputGroup>
        </div>
  
        <div className="col-sm-6 col-md-3 mx-auto">
          <button type="submit" className="btn btn-success add_student w-100" disabled={loading}>
            افزودن دانشجو
          </button>
        </div>
      </form>
  
      {/* جدول دانشجویان */}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th className="text-center">شماره دانشجویی</th>
              <th className="text-center">ایمیل</th>
              <th className="text-center">نام کامل</th>
              <th className="text-center">تلفن</th>
              <th className="text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students
                .filter((stu) =>
                  stu.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((stu) => {
                  const fullName = [stu.first_name, stu.last_name].filter(Boolean).join(" ");
                  const phoneOrEmpty = stu.phone_number ? ` ${stu.phone_number}` : "";
  
                  return (
                    <tr key={stu.username} className="text-center">
                      <td className="text-center">{stu.username}</td>
                      <td className="text-center">{stu.email}</td>
                      <td className="text-center">{fullName || "ثبت نشده "}</td>
                      <td className="text-center">{phoneOrEmpty || "ثبت نشده "}</td>
                      <td className="text-center">
                        <button
                          onClick={() => handleOpenUpdateModal(stu)}
                          className="btn btn-primary btn-sm me-2 edit_student_button"
                          disabled={loading}
                        >
                          به‌روزرسانی
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(stu)}
                          className="btn btn-danger btn-sm remove_student_button"
                          disabled={loading}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  هیچ دانشجویی موجود نیست.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  
      {/* Update Modal using React Bootstrap */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Form onSubmit={handleSubmitUpdate}>
          <Modal.Header closeButton>
            <Modal.Title>به‌روزرسانی دانشجو</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="modalUsername">
              <Form.Label>شماره دانشجویی</Form.Label>
              <Form.Control
                type="text"
                value={modalUsername}
                onChange={(e) => setModalUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalEmail">
              <Form.Label>ایمیل</Form.Label>
              <Form.Control
                type="email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalPassword">
              <Form.Label>رمز عبور</Form.Label>
              <Form.Control
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              بستن
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              ذخیره تغییرات
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
  
      {/* مدال حذف دانشجو */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>حذف دانشجو</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {studentToDelete ? (
            <>
              <p>
                آیا مطمئن هستید که می‌خواهید دانشجو با شماره دانشجویی{" "}
                <strong>{studentToDelete.username}</strong> را حذف کنید؟
              </p>
              <p className="text-danger">این عمل قابل بازگشت نیست!</p>
            </>
          ) : (
            <p>در حال بارگذاری...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={loading}>
            انصراف
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={loading}>
            حذف
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
  
};

export default StudentManagement;
