importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Cấu hình Firebase của bạn
firebase.initializeApp({
  apiKey: "AIzaSyCiKf5nV6VBEoNGVNAQ3CHyqd2e51AkTg4",
  authDomain: "quanlyxe-5f578.firebaseapp.com",
  projectId: "quanlyxe-5f578",
  storageBucket: "quanlyxe-5f578.firebasestorage.app",
  messagingSenderId: "854321564800",
  appId: "1:854321564800:web:427c45569c7e710231aa65"
});

const messaging = firebase.messaging();

// Lắng nghe thông báo khi App đang chạy ngầm hoặc đã tắt
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});