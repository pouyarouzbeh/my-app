import { saveAs } from "file-saver";

export const downloadFile = (blob, filename) => {
  // اگر blob.type ست نشده باشد، کاربرد پیش‌فرض می‌شود
  const file = new Blob([blob], { type: blob.type || "application/octet-stream" });
  saveAs(file, filename);
};
