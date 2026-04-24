import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// BẠN HÃY DÁN ĐOẠN firebaseConfig CỦA BẠN VÀO ĐÂY
const firebaseConfig = {
  apiKey: "AIzaSyCiKf5nV6VBEoNGVNAQ3CHyqd2e51AkTg4",
  authDomain: "quanlyxe-5f578.firebaseapp.com",
  projectId: "quanlyxe-5f578",
  storageBucket: "quanlyxe-5f578.firebasestorage.app",
  messagingSenderId: "854321564800",
  appId: "1:854321564800:web:427c45569c7e710231aa65"
};

const app = initializeApp(firebaseConfig);

export const requestForToken = async () => {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const messaging = getMessaging(app);
      
      // Xin quyền gửi thông báo từ người dùng
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        // Nếu cho phép, lấy mã Token của thiết bị
        const token = await getToken(messaging, {
          vapidKey: "BNv_DdXp2m4jSw856vIIZx1_uZEJDe16LOjYnxC0yZ2P3KbDZBCOLAZ3BSkWkxtlwUTfQ8cgG82psY6Hylq5nU0" // <--- Dán mã ở Bước 1 vào đây
        });
        return token;
      } else {
        alert("Bạn đã từ chối nhận thông báo!");
      }
    }
  } catch (error) {
    console.error("Lỗi lấy token:", error);
  }
  return null;
};