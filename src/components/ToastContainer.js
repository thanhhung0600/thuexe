"use client";
import React, { useEffect, useState } from 'react';

export default function ToastContainer({ toasts }) {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    // Chỉ chạy trên trình duyệt client
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const updatePosition = () => {
      // visualViewport.offsetTop chính là số pixel mà Safari đã đẩy trang web lên 
      // khi bàn phím ảo xuất hiện.
      setKeyboardOffset(window.visualViewport.offsetTop);
    };

    // Lắng nghe sự kiện khi bàn phím bật lên / tắt đi hoặc cuộn
    window.visualViewport.addEventListener('resize', updatePosition);
    window.visualViewport.addEventListener('scroll', updatePosition);
    
    // Gọi ngay lần đầu để lấy vị trí chuẩn
    updatePosition();

    return () => {
      window.visualViewport.removeEventListener('resize', updatePosition);
      window.visualViewport.removeEventListener('scroll', updatePosition);
    };
  }, []);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="absolute left-0 right-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4"
      style={{ 
        // Bám vào top của Layout
        top: 0,
        // Dùng transform để kéo Toast tụt xuống đúng bằng khoảng cách bị đẩy + khoảng cách an toàn tai thỏ (45px)
        transform: `translateY(calc(${keyboardOffset}px + max(env(safe-area-inset-top), 45px)))`,
        transition: 'transform 0.1s ease-out' // Mượt mà khi bàn phím thụt lên/xuống
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} 
            text-white px-6 py-3 rounded-2xl shadow-2xl font-bold 
            flex items-center justify-center gap-2 
            animate-slide-down w-full max-w-[350px] transition-all
            pointer-events-auto
          `}
        >
          <span className="text-[18px] leading-none">
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span className="text-[13px] uppercase tracking-wider text-center">
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}