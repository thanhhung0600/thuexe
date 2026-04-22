"use client";
import React, { useEffect, useState } from 'react';

export default function ToastContainer({ toasts }) {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // 👉 BẠN TÙY CHỈNH ĐỘ SÂU Ở ĐÂY:
  // Giảm số này xuống (ví dụ: 0, 5, hoặc -5) -> Thông báo sẽ nhích lên sát tai thỏ hơn.
  // Tăng số này lên (ví dụ: 20, 30) -> Thông báo sẽ tụt xuống sâu hơn.
  const KHOANG_CACH_TAI_THO = -20; // <--- Sửa con số này cho đến khi bạn ưng ý

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const updatePosition = () => {
      setKeyboardOffset(window.visualViewport.offsetTop);
    };

    window.visualViewport.addEventListener('resize', updatePosition);
    window.visualViewport.addEventListener('scroll', updatePosition);
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
        top: 0,
        // Công thức đã được tối ưu để nhận biến Tùy chỉnh của bạn
        transform: `translateY(calc(${keyboardOffset}px + max(env(safe-area-inset-top), 35px) + ${KHOANG_CACH_TAI_THO}px))`,
        transition: 'transform 0.1s ease-out' 
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