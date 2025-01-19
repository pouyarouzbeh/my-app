// src/utils/apiEndpoints.js

export const apiEndpoints = {
  //--------------------------------------------------------------------------------
  // اپلیکیشن Accounts
  //--------------------------------------------------------------------------------
  // ثبت‌نام کاربر
  registerUser: '/accounts/api/v1/registration/',

  // فعال‌سازی حساب کاربری
  activationConfirm: (token) => `/accounts/api/v1/activation/confirm/${token}`,
  resendActivation: '/accounts/api/v1/activation/resend',

  // تغییر رمز عبور
  changePassword: '/accounts/api/v1/change_password/',

  // JWT
  createToken: '/accounts/api/v1/jwt/create/',
  refreshToken: '/accounts/api/v1/jwt/refresh/',
  verifyToken: '/accounts/api/v1/jwt/verify/',

  // لاگین/لاگ‌اوت
  login: '/accounts/api/v1/token/login/',
  logoutUser: '/accounts/api/v1/token/logout/',

  // پروفایل
  profile: '/accounts/api/v1/profile/',
  getProfileById: (id) => `/accounts/api/v1/profile/${id}/`,
  updateProfileById: (id) => `/accounts/api/v1/profile/${id}/`,
  patchProfileById: (id) => `/accounts/api/v1/profile/${id}/`,

  // کاربران
  getUsers: '/accounts/api/v1/users/',
  createUser: '/accounts/api/v1/users/',
  getUserById: (username) => `/accounts/api/v1/users/${username}/`,
  updateUserById: (username) => `/accounts/api/v1/users/${username}/`,
  deleteUserById: (username) => `/accounts/api/v1/users/${username}/`,
  postUser: `/accounts/api/v1/users/`,

  // فراموشی رمز عبور
  sendPasswordResetEmail: '/accounts/api/v1/password_reset/',
  confirmPasswordReset: (uid, token, newPassword) => `/accounts/api/v1/password_reset_confirm/${uid}/${token}/`,

  //--------------------------------------------------------------------------------
  // اپلیکیشن Website
  //--------------------------------------------------------------------------------
  // Contact
  contact: '/api/v1/contact/',
  getContactById: (id) => `/api/v1/contact/${id}/`,
  updateContactById: (id) => `/api/v1/contact/${id}/`,
  patchContactById: (id) => `/api/v1/contact/${id}/`,
  deleteContactById: (id) => `/api/v1/contact/${id}/`,

  //--------------------------------------------------------------------------------
  // اپلیکیشن پیش ثبت نام (pre_registration)
  //--------------------------------------------------------------------------------

  // بخش Category
  category: '/pre_registration/api/v1/category/',
  categoryById: (id) => `/pre_registration/api/v1/category/${id}/`,

  // سابقه دروس (Course History)
  courseHistory: '/pre_registration/api/v1/course-history/',
  importCourseHistory: '/pre_registration/api/v1/import/course-history/',
  getCourseHistoryById: (id) => `/pre_registration/api/v1/course-history/${id}/`,
  updateCourseHistoryById: (id) => `/pre_registration/api/v1/course-history/${id}/`,
  patchCourseHistoryById: (id) => `/pre_registration/api/v1/course-history/${id}/`,
  deleteCourseHistoryById: (id) => `/pre_registration/api/v1/course-history/${id}/`,
  passedCourses : '/pre_registration/api/v1/course-history/completed-courses/',
  failedCourses: '/pre_registration/api/v1/course-history/failed-courses/',

  // دروس (Course)
  course: '/pre_registration/api/v1/course/',
  PermittedCourse:'/pre_registration/api/v1/permitted-courses/',
  getCourseById: (id) => `/pre_registration/api/v1/course/${id}/`,
  updateCourseById: (id) => `/pre_registration/api/v1/course/${id}/`,
  patchCourseById: (id) => `/pre_registration/api/v1/course/${id}/`,
  deleteCourseById: (id) => `/pre_registration/api/v1/course/${id}/`,
  postCourse: '/pre_registration/api/v1/course/', 

  // ثبت‌نام (Registrations)
  registrations: '/pre_registration/api/v1/registrations/',
  saveRegistrations: '/pre_registration/api/v1/registrations/',
  // termRegistrations: (term_id) => `/pre_registration/api/v1/registrations/user-registrations/${term_id}/`,
  registrationById: (id) => `/pre_registration/api/v1/registrations/${id}/`,
  getRegisterationByUserId: (username_id) => `/pre_registration/api/v1/registrations/user-registrations/${username_id}/`,

  // گزارش‌ها
  reportCourses: (term_id) => `/pre_registration/api/v1/report_courses/${term_id}/`,
};
