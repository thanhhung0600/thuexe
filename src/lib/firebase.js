import { initializeApp } from "firebase/app";
// Đã thêm isSupported để kiểm tra trình duyệt
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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
      
      // 1. Kiểm tra xem thiết bị có hỗ trợ không
      const supported = await isSupported();
      if (!supported) {
        throw new Error("Trình duyệt không hỗ trợ nhận thông báo.");
      }

      // 2. ĐĂNG KÝ SERVICE WORKER (Bắt buộc phải có dòng này cho iOS)
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const messaging = getMessaging(app);
      
      // Xin quyền gửi thông báo từ người dùng
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        // Nếu cho phép, lấy mã Token của thiết bị
        const token = await getToken(messaging, {
          vapidKey: "BNv_DdXp2m4jSw856vIIZx1_uZEJDe16LOjYnxC0yZ2P3KbDZBCOLAZ3BSkWkxtlwUTfQ8cgG82psY6Hylq5nU0",
          // Gắn Service Worker vào lệnh lấy Token
          serviceWorkerRegistration: registration 
        });
        return token;
      } else {
        throw new Error("Bạn đã từ chối nhận thông báo!");
      }
    }
  } catch (error) {
    console.error("Lỗi chi tiết khi lấy token:", error);
    throw error; // Ném lỗi ra ngoài để màn hình chính hiện Toast báo lỗi rõ ràng
  }
  return null;
};