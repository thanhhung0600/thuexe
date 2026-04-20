export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-6 left-1/2 z-[100] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none -translate-x-1/2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${toast.type === "success" ? "bg-green-500" : "bg-red-500"} 
          text-white px-6 py-3 rounded-2xl shadow-2xl font-semibold flex items-center gap-2 animate-slide-down`}
        >
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}