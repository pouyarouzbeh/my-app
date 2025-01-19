import React, { createContext, useReducer, useEffect, useCallback } from "react";
import { logoutUser, getProfileById } from "../../utils/api";
import { getCookie, setCookie, deleteCookie } from "../../utils/cookies";

// Action types
const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";
const SET_LOADING = "SET_LOADING";
const UPDATE_USER = "UPDATE_USER";

// Initial State
const initialState = {
  user: {
    id: null,
    username: "",
    email: "",
    is_admin: false,
    is_active: false,
    is_verified: false,
    isLoggedIn: false,
    max_units: 0,
    first_name: "",
    last_name: "",
    last_average: "",
    phone_number: "",
    is_last_semester: false,
  },
  loading: false,
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        user: { 
          ...action.payload, 
          isLoggedIn: true 
        },
        loading: false,
      };
    case LOGOUT:
      return {
        ...state,
        user: { ...initialState.user },
        loading: false,
      };
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = useCallback(async (userData) => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      if (!userData?.token || typeof userData.token !== "string") {
        throw new Error("Invalid token format or empty token");
      }
      // Dispatch LOGIN with profile data
      dispatch({
        type: LOGIN,
        payload: {
          id: userData.user_id,
          username: userData.username,
          email: userData.email,
          is_admin: userData.is_admin,
          is_active: userData.is_active,
          is_verified: userData.is_verified,
          max_units: userData.max_units || 0,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          last_average: userData.last_average || "",
          phone_number: userData.phone_number || "",
          is_last_semester: userData.is_last_semester || false,
        },
      });

      // Save token and userId in cookies
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);

      setCookie("authToken", userData.token, {
        expires: expireDate,
        path: "/",
      });
      setCookie("userId", userData.user_id, {
        expires: expireDate,
        path: "/",
      });
      setCookie("isAdmin", userData.is_admin, { expires: expireDate, path: "/" }); // اضافه شده


    } catch (error) {
      console.error("Error in login:", error.message);
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    dispatch({ type: SET_LOADING, payload: true });
    try {
      await logoutUser(); // If you have a logout endpoint
      deleteCookie("authToken");
      deleteCookie("userId");

      dispatch({ type: LOGOUT });
      console.log("User successfully logged out.");
    } catch (error) {
      console.error("Error during logout:", error.message);
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  }, []);

  // Update User function
  const updateUser = useCallback((updatedUserData) => {
    dispatch({
      type: UPDATE_USER,
      payload: updatedUserData,
    });
  }, []);

  // Check for token and userId in cookies
useEffect(() => {
  const token = getCookie("authToken");
  const userId = getCookie("userId");
  const isAdmin = getCookie("isAdmin"); // اضافه شده

  if (token && userId) {
    dispatch({ type: SET_LOADING, payload: true });
    const fetchUser = async () => {
      try {
        const response = await getProfileById(userId);
        if (response.data) {
          dispatch({
            type: LOGIN,
            payload: {
              id: response.data.user_id,
              username: response.data.username,
              email: response.data.email,
              is_admin: isAdmin === "true", // از کوکی گرفته شده
              is_active: response.data.is_active,
              is_verified: response.data.is_verified,
              max_units: response.data.max_units || 0,
              first_name: response.data.first_name || "",
              last_name: response.data.last_name || "",
              last_average: response.data.last_average || "",
              phone_number: response.data.phone_number || "",
              is_last_semester: response.data.is_last_semester || false,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error.response?.data || error.message);
        deleteCookie("authToken");
        deleteCookie("userId");
        deleteCookie("isAdmin"); // حذف کوکی
        dispatch({ type: LOGOUT });
      } finally {
        dispatch({ type: SET_LOADING, payload: false });
      }
    };
    fetchUser();
  } else {
    console.warn("No valid token or userId found in cookies.");
  }
}, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
