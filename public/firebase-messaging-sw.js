// public/firebase-messaging-sw.js

// 1. Import thư viện Firebase phiên bản Service Worker
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// 2. Khởi tạo Firebase (Sử dụng đúng thông tin Config trong Firebase Console của bạn)
firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "ten-du-an.firebaseapp.com",
  projectId: "ten-du-an",
  storageBucket: "ten-du-an.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

// 3. Lắng nghe thông báo khi App đang chạy ngầm hoặc đã đóng
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Nhận được tin nhắn ngầm:', payload);

  const notificationTitle = payload.data?.title || 'Lịch trình xe mới 🗓️';
  const notificationOptions = {
    body: payload.data?.body || 'Bạn có lịch xe mới cần kiểm tra ngay!',
    icon: '/icon-192x192.png', // Đường dẫn ảnh logo app của bạn
    badge: '/icon-192x192.png',
    tag: 'lich-xe-nhac-nho', // Giúp gộp các thông báo lại, không bị hiện quá nhiều dòng
    renotify: true
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});