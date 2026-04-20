export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-6 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${toast.type === "success" ? "bg-green-500" : "bg-red-500"} 
            text-white px-6 py-3 rounded-2xl shadow-2xl font-bold 
            flex items-center justify-center gap-2 
            animate-slide-down w-full max-w-[350px] transition-all
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