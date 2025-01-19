// src/utils/cookies.js

export const setCookie = (name, value, options = {}) => {
  let updatedCookie = `${name}=${encodeURIComponent(value)}`;

  if (options.expires) {
    updatedCookie += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    updatedCookie += `; path=${options.path}`;
  } else {
    updatedCookie += `; path=/`;
  }
  if (options.sameSite) {
    updatedCookie += `; SameSite=${options.sameSite}`;
  } else {
    updatedCookie += `; SameSite=Lax`;
  }
  if (options.secure) {
    updatedCookie += `; Secure`;
  }

  document.cookie = updatedCookie;
};

export const getCookie = (name) => {
  const cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    const [cookieName, cookieValue] = cookies[i].split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

export const deleteCookie = (name, options = {}) => {
  setCookie(name, "", { ...options, expires: new Date(0) });
};
