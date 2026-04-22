export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    // ✅ CHỈ SỬA DÒNG NÀY: 
    // 1. Đổi top-6 thành top-0
    // 2. Tăng z-index lên 99999 để không bị bất kỳ khung nào đè lên
    // 3. Thêm pt-[calc(env(safe-area-inset-top)+16px)] để tự động né tai thỏ của iPhone
    <div className="fixed top-0 left-0 right-0 z-[99999] flex flex-col items-center gap-2 pointer-events-none px-4 pt-[calc(env(safe-area-inset-top)+16px)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} 
            text-white px-6 py-3 rounded-2xl shadow-2xl font-bold 
            flex items-center justify-center gap-2 
            animate-slide-down w-full max-w-[350px] transition-all
            pointer-events-auto /* Thêm cái này để lỡ bạn muốn click vào Toast sau này */
          `}
        >
          {/* Giữ nguyên Icon của bạn */}
          <span className="text-[18px] leading-none">
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {/* Giữ nguyên Text của bạn */}
          <span className="text-[13px] uppercase tracking-wider text-center">
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  );
}