// RegistrationForm.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  getCategory,
  getCategoryById,
  getCourseHistory,
  getPermittedCourses,
  saveRegistration,  
} from "../utils/api";
import { AuthContext } from "./context/AuthContext";
import "../assets/css/common.css";
import "../assets/css/registration.css";
import moment from 'moment-jalaali'; // برای کار با تاریخ شمسی
import Notification from "../components/adminpanel/Notification"; // ایمپورت Notification
import { useNavigate } from "react-router-dom"; // ایمپورت useNavigate برای ریدایرکت

const RegistrationForm = () => {
  const { user, loading } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [passedCourses, setPassedCourses] = useState([]);   
  const [selectedCourses, setSelectedCourses] = useState([]); 
  const [totalUnits, setTotalUnits] = useState(0);
  const [currentTerm, setCurrentTerm] = useState("");
  const [permittedCourses, setPermittedCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const navigate = useNavigate(); // استفاده از useNavigate

  const calculateCurrentTerm = useCallback(() => {
    const today = moment();
    const jYear = today.jYear();
    const jMonth = today.jMonth() + 1; // jMonth از 0 شروع می‌شود

    // تعریف تاریخ شروع ترم اول و دوم
    // فرض بر این است که ترم اول از فروردین تا شهریور (ماه 1 تا 6) و ترم دوم از مهر تا اسفند (ماه 7 تا 12) است
    let termSuffix = 'a'; // ترم اول
    let startYear = jYear;
    let endYear = jYear + 1;

    if (jMonth >= 7 && jMonth <= 12) { // ترم دوم از مهر (ماه 7) تا اسفند (ماه 12)
      termSuffix = 'b';
      startYear = jYear;
      endYear = jYear + 1;
    }

    return `${startYear}-${endYear}-${termSuffix}`;
  }, []);

  // دریافت ترم جاری و دروس مجاز
  useEffect(() => {
    if (!user?.isLoggedIn) {
      console.log("کاربر وارد نشده است.");
      setIsDataLoading(false); // اطمینان از اینکه در نهایت isDataLoading به false تنظیم می‌شود
      return;
    }

    const fetchInitialData = async () => {
      try {
        moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });
        const term = calculateCurrentTerm();
        setCurrentTerm(term);
        console.log("ترم فعلی محاسبه شده:", term);

        const permittedCoursesResponse = await getPermittedCourses();
        console.log("پاسخ دروس مجاز:", permittedCoursesResponse);

        // استخراج دروس مجاز از data.results یا data
        let permitted = [];
        if (Array.isArray(permittedCoursesResponse.data.results)) {
          permitted = permittedCoursesResponse.data.results.map(course => course.id);
        } else if (Array.isArray(permittedCoursesResponse.data)) {
          permitted = permittedCoursesResponse.data.map(course => course.id);
        }
        console.log("دروس مجاز استخراج شده:", permitted);
        setPermittedCourses(permitted);
      } catch (err) {
        console.error("خطا در دریافت داده‌های اولیه:", err.response?.data || err.message);
        setError(err.response?.data || err.message);
      } finally {
        setIsDataLoading(false); // اطمینان از اینکه در نهایت isDataLoading به false تنظیم می‌شود
      }
    };

    fetchInitialData();
  }, [user?.isLoggedIn, calculateCurrentTerm]);

  // دریافت اطلاعات تاریخچه درس‌ها
  useEffect(() => {
    if (!user?.isLoggedIn) return;
    if (permittedCourses.length === 0) {
      console.log("لیست دروس مجاز خالی است.");
      return;
    }

    const fetchCourseHistory = async () => {
      try {
        const courseHistoryResponse = await getCourseHistory();
        console.log("پاسخ تاریخچه درس‌ها:", courseHistoryResponse);

        // استخراج درس‌های پاس‌شده از courseHistoryResponse.data.results یا data
        let courseHistoryData = [];
        if (Array.isArray(courseHistoryResponse.data.results)) {
          courseHistoryData = courseHistoryResponse.data.results;
        } else if (Array.isArray(courseHistoryResponse.data)) {
          courseHistoryData = courseHistoryResponse.data;
        }
        console.log("داده‌های تاریخچه درس‌ها استخراج شده:", courseHistoryData);

        const passed = courseHistoryData
          .filter(courseHistory => courseHistory.status.toLowerCase() === "completed")
          .map(courseHistory => {
            if (typeof courseHistory.course === 'object' && courseHistory.course !== null) {
              return courseHistory.course.id;
            }
            return courseHistory.course; // اگر courseHistory.course مستقیماً id است
          });
        console.log("درس‌های پاس‌شده استخراج شده:", passed);
        setPassedCourses(passed);
      } catch (err) {
        console.error("خطا در دریافت تاریخچه درس‌ها:", err.response?.data || err.message);
        setError(err.response?.data || err.message);
      }
    };

    fetchCourseHistory();
  }, [user?.isLoggedIn, permittedCourses]);

  // دریافت دسته‌بندی‌ها و درس‌های مرتبط
  useEffect(() => {
    if (!user?.isLoggedIn) return;
    if (permittedCourses.length === 0 || passedCourses.length === 0) {
      console.log("لیست دروس مجاز یا دروس پاس‌شده خالی است.");
      return;
    }

    const fetchCategoriesAndCourses = async () => {
      try {
        const categoriesResponse = await getCategory();
        console.log("پاسخ دسته‌بندی‌ها:", categoriesResponse);

        // استخراج دسته‌بندی‌ها از data.results یا data
        let categoriesData = [];
        if (Array.isArray(categoriesResponse.data.results)) {
          categoriesData = categoriesResponse.data.results;
        } else if (Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data;
        }
        console.log("داده‌های دسته‌بندی استخراج شده:", categoriesData);

        if (!Array.isArray(categoriesData)) {
          throw new Error("فرمت داده‌های دریافت شده برای دسته‌بندی‌ها نامعتبر است.");
        }

        const categoriesWithCourses = await Promise.all(
          categoriesData.map(async (category) => {
            const coursesResponse = await getCategoryById(category.id);
            console.log(`پاسخ درس‌ها برای دسته‌بندی ${category.id}:`, coursesResponse);

            // استخراج درس‌ها از data.results یا data.courses
            let coursesData = [];
            if (Array.isArray(coursesResponse.data.results)) {
              coursesData = coursesResponse.data.results;
            } else if (Array.isArray(coursesResponse.data.courses)) {
              coursesData = coursesResponse.data.courses;
            }
            console.log(`داده‌های درس‌ها برای دسته‌بندی ${category.id} استخراج شده:`, coursesData);

            // فیلتر کردن دروس بر اساس دروس مجاز و پیش‌نیازها
            const filteredCourses = coursesData.filter(course => {
              const isPermitted = permittedCourses.includes(course.id);
              const hasPrerequisites = course.prerequisites
                ? course.prerequisites.every(prereq => passedCourses.includes(prereq))
                : true;
              return isPermitted && hasPrerequisites;
            });
            console.log(`درس‌های فیلتر شده برای دسته‌بندی ${category.id}:`, filteredCourses);

            return { ...category, courses: filteredCourses };
          })
        );

        console.log("دسته‌بندی‌ها با درس‌های فیلتر شده:", categoriesWithCourses);
        setCategories(categoriesWithCourses);
      } catch (err) {
        console.error("خطا در دریافت دسته‌بندی‌ها و درس‌ها:", err.response?.data || err.message);
        setError(err.response?.data || err.message);
      }
    };

    fetchCategoriesAndCourses();
  }, [user?.isLoggedIn, permittedCourses, passedCourses]);

  // انتخاب یا حذف درس
  const handleCourseToggle = useCallback((course) => {
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    const hasPrerequisites = course.prerequisites
      ? course.prerequisites.every(prereq => passedCourses.includes(prereq))
      : true;

    if (!hasPrerequisites && !isSelected) {
      setError(`برای ثبت درس "${course.name}" باید دروس پیش‌نیاز را گذرانده باشید.`);
      return;
    }

    if (isSelected) {
      setSelectedCourses(prevSelected => prevSelected.filter((c) => c.id !== course.id));
      setTotalUnits(prevTotal => prevTotal - course.credit);
      console.log(
        "درس حذف شده:",
        course.id,
        "مجموع واحدها:",
        totalUnits - course.credit
      );
    } else if (totalUnits + course.credit <= user.max_units) { // استفاده از user.max_units
      setSelectedCourses(prevSelected => [...prevSelected, course]);
      setTotalUnits(prevTotal => prevTotal + course.credit);
      console.log(
        "درس انتخاب شده:",
        course.id,
        "مجموع واحدها:",
        totalUnits + course.credit
      );
    } else {
      setError("مجموع واحدها از سقف مجاز بیشتر است.");
      console.log(
        "تلاش برای اضافه کردن درس با واحد بیشتر از سقف مجاز:",
        course.id
      );
    }
  }, [selectedCourses, totalUnits, user.max_units, passedCourses]);

  const handleSubmitRegistration = async () => {
    if (selectedCourses.length === 0) {
      setError("هیچ درسی انتخاب نشده است!");
      return;
    }
  
    const registrationData = {
      term: currentTerm,
      courses_id: selectedCourses.map((c) => c.id) 
    };
  
    console.log("داده‌های ثبت‌نام ارسال شده:", registrationData);
  
    try {
      setIsSubmitting(true);
      const response = await saveRegistration(registrationData, user.token);
      if (response.status === 200 || response.status === 201) {
        console.log("ثبت پیش‌ثبت‌نام موفق:", response.data);
        setSuccess("پیش ثبت‌نام شما با موفقیت انجام شد!");
        setSelectedCourses([]);
        setTotalUnits(0);
        // ریدایرکت به صفحه اصلی پس از ۱ ثانیه
        setTimeout(() => {
          navigate("/"); // مسیر مورد نظر را تنظیم کنید
        }, 1000);
      } else {
        console.error("پاسخ غیرمنتظره از سرور:", response);
        setError("پاسخ غیرمنتظره از سرور دریافت شد.");
      }
    } catch (error) {
      if (error.response) {
        console.error("خطا در ثبت پیش‌ثبت‌نام:", error.response.data);
        // کیس‌بندی خطاها بر اساس محتوا
        if (error.response.data.code === "PREREQUISITE_NOT_MET") {
          setError("عدم رعایت پیش نیاز برای ثبت این درس.");
        } else if (error.response.data.code === "MAX_UNITS_EXCEEDED") {
          setError("تعداد واحد انتخابی از حد مجاز تجاوز کرده است.");
        } else {
          setError(`خطا در ثبت پیش‌ثبت‌نام`);
        }
      } else if (error.request) {
        console.error("خطا در ثبت پیش‌ثبت‌نام: پاسخ سرور دریافت نشد.");
        setError("خطا در ثبت پیش‌ثبت‌نام: پاسخ سرور دریافت نشد.");
      } else {
        console.error("خطا در ثبت پیش‌ثبت‌نام:", error.message);
        setError(`خطا در ثبت پیش‌ثبت‌نام: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // لاگ وضعیت‌های جاری برای دیباگ
  useEffect(() => {
    console.log("وضعیت رندرینگ - دسته‌بندی‌ها:", categories);
    console.log("وضعیت رندرینگ - درس‌های پاس‌شده:", passedCourses);
    console.log("وضعیت رندرینگ - درس‌های انتخاب‌شده:", selectedCourses);
    console.log("وضعیت رندرینگ - مجموع واحدها:", totalUnits);
    console.log("حداکثر واحد مجاز:", user.max_units); // لاگ اضافه شده
  }, [categories, passedCourses, selectedCourses, totalUnits, user.max_units]);

  // افزودن useEffect برای پاک کردن پیام موفقیت و خطا بعد از مدت زمان مشخص
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000); // نوتیفیکیشن بعد از ۳ ثانیه پاک می‌شود
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // نوتیفیکیشن بعد از ۵ ثانیه پاک می‌شود
      return () => clearTimeout(timer);
    }
  }, [error]);

  // نمایش وضعیت بارگذاری
  if (loading || isDataLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  if (!user?.isLoggedIn) {
    return <div>لطفاً وارد حساب کاربری خود شوید.</div>;
  }

  return (
    <div className="registration-form-container mx-auto">
      <div className="container mt-4 text-center">
        <h2 className="registration-form-title mb-4">فرم پیش ثبت‌نام دانشگاه</h2>

        {/* اعلان خطا یا موفقیت */}
        {error && (
          <Notification
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Notification
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}

        <div className="form-group current_term">
          <span>ترم جاری شما:</span>
          <p className="mt-2 term-display">
            <strong>{currentTerm || "در حال بارگذاری..."}</strong>
          </p>
        </div>

        <p className="registration-form-info">
          سقف واحد مجاز: <strong>{user.max_units}</strong> {/* استفاده از user.max_units */}
        </p>
        <p className="registration-form-info mb-4">
          واحدهای انتخاب‌شده: <strong>{totalUnits}</strong>
        </p>

        <div className="accordion registration-accordion" id="courseAccordion">
          {categories.length === 0 ? (
            <div>دسته‌بندی یا درسی برای نمایش وجود ندارد.</div>
          ) : (
            categories.map((category) => (
              <div className="accordion-item" key={category.id}>
                <h2 className="accordion-header" id={`heading-${category.id}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${category.id}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${category.id}`}
                  >
                    {category.name}
                  </button>
                </h2>
                <div
                  id={`collapse-${category.id}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${category.id}`}
                  data-bs-parent="#courseAccordion"
                >
                  <div className="accordion-body">
                    {category.courses.length === 0 ? (
                      <div className="alert alert-warning">
                        هیچ درسی در این دسته‌بندی موجود نیست.
                      </div>
                    ) : (
                      <ul className="list-group registration-list-group">
                        {category.courses.map((course) => {
                          const isSelected = selectedCourses.some((c) => c.id === course.id);
                          const hasPrerequisites = course.prerequisites
                            ? course.prerequisites.every(prereq => passedCourses.includes(prereq))
                            : true;

                          return (
                            <li
                              key={course.id}
                              className={`list-group-item d-flex justify-content-between align-items-center ${!hasPrerequisites ? 'disabled' : ''}`}
                            >
                              <span>
                                {course.name} ({course.credit} واحد)
                                {!hasPrerequisites && (
                                  <span className="text-danger">
                                    {" "}
                                    - نیازمند پیش‌نیاز: {course.prerequisites.join(', ')}
                                  </span>
                                )}
                              </span>
                              <button
                                className={`btn btn-sm ${isSelected ? "btn-danger" : "btn-primary"}`}
                                onClick={() => handleCourseToggle(course)}
                                disabled={!hasPrerequisites}
                              >
                                {isSelected ? "حذف" : "انتخاب"}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="btn mt-4 registration-form-submit-btn"
          disabled={selectedCourses.length === 0 || isSubmitting}
          onClick={handleSubmitRegistration}
        >
          {isSubmitting ? "در حال ثبت..." : "تکمیل پیش ثبت‌نام"}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
