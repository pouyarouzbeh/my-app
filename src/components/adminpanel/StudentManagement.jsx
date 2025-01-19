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
import { FaEye, FaEyeSlash, FaSearch } from "react-icons/fa"; // وارد کردن آیکون‌ها
import { AuthContext } from "../../components/context/AuthContext"; // وارد کردن AuthContext

const StudentManagement = () => {
  const [students, setStudents] = useState([]);  // فهرست کاربران + پروفایل
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [modalUsername, setModalUsername] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [ModalPassword, setModalPassword] = useState("");

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
      password: ModalPassword.trim()
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
  //  حذف کاربر
  // =========================================================================
  const handleRemoveStudent = async (username) => {
    if (!window.confirm("آیا مطمئن هستید می‌خواهید این دانشجو را حذف کنید؟")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("در حال حذف دانشجو:", username);
      await deleteUserById(username);
      setSuccess("دانشجو با موفقیت حذف شد.");

      // به‌روزرسانی لیست دانشجویان در state
      setStudents(prev => prev.filter(stu => stu.username !== username));
    } catch (err) {
      console.error("خطا در حذف دانشجو:", err);
      setError(err.response?.data?.message || "خطا در حذف دانشجو.");
    } finally {
      setLoading(false);
    }
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
        <div className="col-sm-6 col-md-2">
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

        <div className="col-sm-6 col-md-2 text-end">
          <button type="submit" className="btn btn-success add_student w-100" disabled={loading}>
            افزودن دانشجو
          </button>
        </div>
      </form>

      

      {/* لیست دانشجویان */}
      <ul className="list-group">
        {students.length > 0 ? (
          students
            .filter((stu) => 
              stu.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((stu) => {
              const fullName = [stu.first_name, stu.last_name].filter(Boolean).join(" ");
              const phoneOrEmpty = stu.phone_number ? `تلفن: ${stu.phone_number}` : "";

              return (
                <li
                  key={stu.username}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{stu.username}</strong> - {stu.email}
                    {fullName && ` / ${fullName}`}
                    {phoneOrEmpty && ` / ${phoneOrEmpty}`}
                  </div>
                  <div>
                    <button
                      onClick={() => handleOpenUpdateModal(stu)}
                      className="btn btn-primary edit_student_button btn-sm me-2 m-2"
                      disabled={loading}
                    >
                      به‌روزرسانی
                    </button>
                    <button
                      onClick={() => handleRemoveStudent(stu.username)}
                      className="btn btn-danger remove_student_button btn-sm m-2"
                      disabled={loading}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              );
            })
        ) : (
          <li className="list-group-item">هیچ دانشجویی موجود نیست.</li>
        )}
      </ul>

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
                value={ModalPassword}
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
    </div>
  );
};

export default StudentManagement;
