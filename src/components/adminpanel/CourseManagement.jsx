// src/components/CourseManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  getCourses,
  postCourse,
  updateCourseById,
  deleteCourseById,
  getCategory,
} from "../../utils/api";

import Notification from "./Notification";
import "../../assets/css/administrator.css";
import { Modal, Button, Form, InputGroup, Spinner, Table } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import Select from 'react-select'; // استفاده از react-select

const CourseManagement = () => {
  const [courses, setCourses] = useState([]); // لیست درس‌ها
  const [categories, setCategories] = useState([]); // لیست دسته‌بندی‌ها
  const [availableCourses, setAvailableCourses] = useState([]); // برای پیش‌نیازها
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // جستجو

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [modalData, setModalData] = useState({
    name: "",
    credit: "",
    category: "",
    prerequisite_course: [],
  });

  // State‌های جدید برای مدال حذف
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // دریافت لیست درس‌ها و دسته‌بندی‌ها
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    // setSuccess(""); // این خط را حذف کنید

    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        getCourses(),
        getCategory(), // دریافت دسته‌بندی‌ها
      ]);

      const coursesData = coursesRes.data.results || coursesRes.data || [];
      const categoriesData = categoriesRes.data.results || categoriesRes.data || [];

      setCourses(coursesData);
      setCategories(categoriesData);
      setAvailableCourses(coursesData); // برای پیش‌نیازها
    } catch (err) {
      console.error("Error fetching courses or categories:", err);
      setError(err.response?.data?.message || "خطا در دریافت لیست درس‌ها یا دسته‌بندی‌ها.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle react-select change for prerequisites
  const handlePrerequisitesChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setModalData((prev) => ({
      ...prev,
      prerequisite_course: selectedIds,
    }));
  };

  // Add course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await postCourse({
        ...modalData,
        credit: parseInt(modalData.credit, 10),
        category: parseInt(modalData.category, 10),
        prerequisite_course: modalData.prerequisite_course.map(Number),
      });
      setSuccess("درس با موفقیت افزوده شد.");
      fetchData();
      setModalData({ name: "", credit: "", category: "", prerequisite_course: [] });
    } catch (err) {
      console.error("خطا در افزودن درس:", err);
      setError(err.response?.data?.message || "خطا در افزودن درس.");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for editing
  const handleOpenUpdateModal = (course) => {
    setCurrentCourse(course);
    setModalData({
      name: course.name,
      credit: course.credit,
      category: course.category ? course.category.id : "",
      prerequisite_course: course.prerequisite_course ? course.prerequisite_course.map(p => p.id) : [],
    });
    setShowModal(true);
  };

  // Update course
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!currentCourse) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateCourseById(currentCourse.id, {
        ...modalData,
        credit: parseInt(modalData.credit, 10),
        category: parseInt(modalData.category, 10),
        prerequisite_course: modalData.prerequisite_course.map(Number),
      });
      setSuccess("درس با موفقیت به‌روزرسانی شد.");
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.error("خطا در به‌روزرسانی درس:", err);
      setError(err.response?.data?.message || "خطا در به‌روزرسانی درس.");
    } finally {
      setLoading(false);
    }
  };

  // حذف درس با استفاده از مدال
  const handleRemoveCourse = (course) => {
    // این تابع فقط مدال را باز می‌کند و courseToDelete را ست می‌کند
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // تایید حذف درس از مدال
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await deleteCourseById(courseToDelete.id);
      setSuccess("درس با موفقیت حذف شد.");
      fetchData();
      handleCloseDeleteModal();
    } catch (err) {
      console.error("خطا در حذف درس:", err);
      setError(err.response?.data?.message || "خطا در حذف درس.");
    } finally {
      setLoading(false);
    }
  };

  // بستن مدال حذف
  const handleCloseDeleteModal = () => {
    setCourseToDelete(null);
    setShowDeleteModal(false);
  };

  // فیلتر کردن لیست درس‌ها بر اساس جستجو
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // گزینه‌های دسته‌بندی برای dropdown
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
  }));

  // گزینه‌های پیش‌نیازها برای react-select
  const prerequisiteOptions = availableCourses
    .filter(course => !currentCourse || course.id !== currentCourse.id) // جلوگیری از انتخاب خود درس به عنوان پیش‌نیاز
    .map(course => ({
      value: course.id,
      label: course.name,
    }));

  // مقدار انتخاب شده برای پیش‌نیازها در modal
  const selectedPrerequisites = modalData.prerequisite_course.map(id => {
    const course = availableCourses.find(c => c.id === id);
    return course ? { value: course.id, label: course.name } : null;
  }).filter(Boolean);

  // افزودن useEffect برای پاک کردن پیام موفقیت و خطا بعد از مدت زمان مشخص
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000); // نوتیفیکیشن بعد از ۳ ثانیه پاک می‌شود
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000); // نوتیفیکیشن بعد از ۵ ثانیه پاک می‌شود
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="container management-container">
      <h2 className="my-4">مدیریت درس‌ها</h2>

      {/* اعلان خطا یا موفقیت */}
      {error && (
        <Notification message={error} type="error" onClose={() => setError("")} />
      )}
      {success && (
        <Notification message={success} type="success" onClose={() => setSuccess("")} />
      )}
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">در حال بارگذاری...</span>
          </Spinner>
        </div>
      )}

      {/* فیلد جستجو با InputGroup و آیکون جستجو */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <InputGroup>
            <Form.Control
              type="text"
              className="form-control input_placeholder1"
              placeholder="جستجو بر اساس نام درس"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
          </InputGroup>
        </div>
      </div>

      {/* فرم افزودن درس */}
      <form onSubmit={handleAddCourse} className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <Form.Group controlId="formCourseName">
            <Form.Control
              type="text"
              name="name"
              className="form-control input_placeholder1"
              placeholder="نام درس"
              value={modalData.name}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
              required
            />
          </Form.Group>
        </div>
        <div className="col-sm-6 col-md-2">
          <Form.Group controlId="formCourseCredit">
            <Form.Control
              type="number"
              name="credit"
              className="form-control input_placeholder1"
              placeholder="تعداد واحد"
              min="1"
              value={modalData.credit}
              onChange={(e) => setModalData({ ...modalData, credit: e.target.value })}
              required
            />
          </Form.Group>
        </div>
        <div className="col-sm-6 col-md-2">
          <Form.Group controlId="formCourseCategory">
            <Form.Control
              as="select"
              name="category"
              className="form-control input_placeholder1"
              value={modalData.category}
              onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
              required
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Group controlId="formCoursePrerequisites">
            <Select
              isMulti
              name="prerequisite_course"
              options={prerequisiteOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="انتخاب پیش‌نیازها"
              value={selectedPrerequisites}
              onChange={handlePrerequisitesChange}
            />
          </Form.Group>
        </div>
        <div className="col-sm-6 col-md-2 d-flex text-end">
          <button type="submit" className="btn btn-success w-100 add_student" disabled={loading}>
            افزودن درس
          </button>
        </div>
      </form>

      {/* لیست درس‌ها در قالب جدول مشابه پنل ادمین جنگو */}
      <Table striped bordered hover responsive >
        <thead className="text-center">
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">نام</th>
            <th className="text-center">تعداد واحد</th>
            <th className="text-center">دسته‌بندی</th>
            <th className="text-center">پیش‌نیازها</th>
            <th className="text-center">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <tr key={course.id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{course.name}</td>
                <td className="text-center">{course.credit}</td>
                <td className="text-center">{course.category ? course.category.name : "نامشخص"}</td>
                <td className="text-center">
                  {course.prerequisite_course && course.prerequisite_course.length > 0
                    ? "دارد"
                    : "ندارد"}
                </td>
                <td className="text-center">
                  <button
                    onClick={() => handleOpenUpdateModal(course)}
                    className="btn btn-primary btn-sm me-2 edit_student_button"
                    disabled={loading}
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleRemoveCourse(course)}
                    className="btn btn-danger btn-sm remove_student_button"
                    disabled={loading}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">هیچ درسی موجود نیست.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal برای به‌روزرسانی درس */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmitUpdate}>
          <Modal.Header closeButton>
            <Modal.Title>ویرایش درس</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="modalCourseName">
              <Form.Label>نام درس</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={modalData.name}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalCourseCredit">
              <Form.Label>تعداد واحد</Form.Label>
              <Form.Control
                type="number"
                name="credit"
                value={modalData.credit}
                onChange={(e) => setModalData({ ...modalData, credit: e.target.value })}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalCourseCategory">
              <Form.Label>دسته‌بندی</Form.Label>
              <Form.Control
                as="select"
                name="category"
                className="form-control input_placeholder1"
                value={modalData.category}
                onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
                required
              >
                <option value="">انتخاب دسته‌بندی</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="modalCoursePrerequisites">
              <Form.Label>پیش‌نیازها</Form.Label>
              <Select
                isMulti
                name="prerequisite_course"
                options={prerequisiteOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="انتخاب پیش‌نیازها"
                value={selectedPrerequisites}
                onChange={handlePrerequisitesChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
              بستن
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              ذخیره تغییرات
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* مدال حذف درس */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>حذف درس</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {courseToDelete ? (
            <>
              <p>
                آیا مطمئن هستید که می‌خواهید درس <strong>{courseToDelete.name}</strong> را حذف کنید؟
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

export default CourseManagement;
