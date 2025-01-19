// api.js
import axios from 'axios';
import { apiEndpoints } from './apiEndpoints';
import Cookies from "js-cookie"; 

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // تنظیم baseURL به دلخواه شما
});

// افزودن interceptor برای تنظیم هدر Authorization و Content-Type به صورت شرطی
api.interceptors.request.use(
  (config) => {
    
    const token = Cookies.get("authToken"); 
    if (token) {
   
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Authorization Header:", config.headers["Authorization"]);
    }

    // اگر داده‌ها از نوع FormData نیستند، تنظیم Content-Type به application/json
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else {
      // حذف Content-Type برای درخواست‌های FormData تا axios خودش آن را تنظیم کند
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);




export const getReportCourses = (term_id) => {
  return api.get(apiEndpoints.reportCourses(term_id), {
  });
};


export const postReportCourses = (term_id, format) => {
  return api.post(apiEndpoints.reportCourses(term_id), { format }, { responseType: 'blob' });
};



// توابع API
export const registerUser = (data) => api.post(apiEndpoints.registerUser, data);
export const activationConfirm = (token) => api.get(apiEndpoints.activationConfirm(token));
export const resendActivation = (data) => api.post(apiEndpoints.resendActivation , data);

export const changePassword = (data) => api.put(apiEndpoints.changePassword, data);
export const loginUser = (credentials) => api.post(apiEndpoints.login, credentials);
export const refreshToken = (data) => api.post(apiEndpoints.refreshToken, data);
export const verifyToken = (data) => api.post(apiEndpoints.verifyToken, data);
export const getAllProfiles = () => api.get(apiEndpoints.profile);
export const getProfileById = (id) => api.get(apiEndpoints.getProfileById(id));
export const getCategory = () => api.get(apiEndpoints.category);
export const getCategoryById = (id) => api.get(apiEndpoints.categoryById(id));

export const updateProfileById = (id, data) => api.put(apiEndpoints.updateProfileById(id), data);
export const getUsers = () => api.get(apiEndpoints.getUsers);
export const createUser = (user) => api.post(apiEndpoints.createUser, user);
export const postUser = (user) => api.post(apiEndpoints.postUser, user);
export const getUserById = (username) => api.get(apiEndpoints.getUserById(username));
export const updateUserById = (username, data) => api.patch(apiEndpoints.updateUserById(username), data);
export const deleteUserById = (username) => api.delete(apiEndpoints.deleteUserById(username));

export const importCourseHistory = (formData) => {
  return api.post(apiEndpoints.importCourseHistory, formData, {
  });
};

export const getCourseHistory = () => api.get(apiEndpoints.courseHistory);
export const getPassedCourses = () => api.get(apiEndpoints.passedCourses);
export const getFailedCourses = () => api.get(apiEndpoints.failedCourses);
export const getPermittedCourses = () => api.get(apiEndpoints.PermittedCourse);
export const getCourseHistoryById = (id) => api.get(apiEndpoints.getCourseHistoryById(id));
export const getCourses = () => api.get(apiEndpoints.course);

export const getCourseById = (id) => api.get(apiEndpoints.getCourseById(id));
export const updateCourseById = (id, data) => api.put(apiEndpoints.updateCourseById(id), data);
export const patchCourseById = (id, data) => api.patch(apiEndpoints.patchCourseById(id), data);
export const deleteCourseById = (id) => api.delete(apiEndpoints.deleteCourseById(id));
export const postCourse = (data) => api.post(apiEndpoints.postCourse, data); // Added postCourse

export const sendPasswordResetEmail = (data) => api.post(apiEndpoints.sendPasswordResetEmail, data);
export const confirmPasswordReset = (uid, token, data) => api.post(apiEndpoints.confirmPasswordReset(uid, token), data);

export const getRegistrations = () => api.get(apiEndpoints.registrations);
export const getRegisterationByUserId = (user_id) => api.get(apiEndpoints.getRegisterationByUserId(user_id));

// export const getTermRegistrations = (term_id) => api.get(apiEndpoints.userRegistrations(term_id));
export const getRegistrationById = (id) => api.get(apiEndpoints.registrationById(id));
export const updateRegistrationById = (id, data) => api.put(apiEndpoints.registrationById(id), data);
export const saveRegistration = (data) => api.post(apiEndpoints.saveRegistrations, data);
export const deleteRegistrationById = (id) => api.delete(apiEndpoints.registrationById(id));







// توابع مربوط به Contact
export const postContact = (data) => api.post(apiEndpoints.contact, data);
export const getContacts = () => api.get(apiEndpoints.contact);
export const getContactById = (id) => api.get(apiEndpoints.getContactById(id));
export const updateContactById = (id, data) => api.put(apiEndpoints.updateContactById(id), data);
export const deleteContactById = (id) => api.delete(apiEndpoints.deleteContactById(id));

// تابع خروج از حساب کاربری
export const logoutUser = () => api.post(apiEndpoints.logoutUser);

export default api;
