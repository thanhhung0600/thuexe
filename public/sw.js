// Sự kiện lắng nghe thông báo đẩy (Push Notification)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200], // Rung điện thoại
      data: { url: data.url || '/' } // Đường dẫn khi bấm vào thông báo
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Sự kiện khi người dùng bấm vào thông báo
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});