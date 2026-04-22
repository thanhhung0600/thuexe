export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4"
      // ✅ BÍ QUYẾT Ở ĐÂY: Dùng hàm max() để khóa cứng khoảng cách an toàn, 
      // không cho phép thông báo nhảy lên cao hơn 55px kể cả khi mở bàn phím
      style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 55px) + 16px)' }}
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