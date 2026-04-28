"use client";
import ThongKe from "../components/thongke";
import TimKiem from "../components/timkiem";
import { useState, useEffect } from "react";
import DatLich from "../components/datlich";
import XemLich from "../components/xemlich";
import ToastContainer from "../components/ToastContainer";
import NavigationTabs from "../components/NavigationTabs";

// Import hàm xin quyền thông báo từ file firebase.js
import { requestForToken } from "../lib/firebase";

export default function Home() {
  const [activeTab, setActiveTab] = useState("xem-lich");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý việc đóng/mở menu cài đặt
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // 1. State Chế độ xem mặc định (Ngày/Tuần)
  const [defaultView, setDefaultView] = useState("day");

  // 2. State quản lý 3 khung giờ thông báo cố định
  const [notis, setNotis] = useState([
    { id: 1, label: "Sáng (07:00)", enabled: false },
    { id: 2, label: "Trưa (11:00)", enabled: false },
    { id: 3, label: "Tối (19:00)", enabled: false },
  ]);

  // Kiểm tra lựa chọn đã lưu khi vừa mở App
  useEffect(() => {
    // Load chế độ xem (Ngày/Tuần)
    const savedView = localStorage.getItem("defaultViewMode") || "day";
    setDefaultView(savedView);

    // Load trạng thái bật/tắt thông báo
    const savedNotis = localStorage.getItem("notiSettings");
    if (savedNotis) {
      setNotis(JSON.parse(savedNotis));
    }
  }, []);

  // --- ĐOẠN MỚI: Tự động kiểm tra và gia hạn Token chạy ngầm ---
  useEffect(() => {
    const autoFetchToken = async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        // Nếu người dùng ĐÃ TỪNG cho phép (granted) thì tự động lấy token ngầm
        if (Notification.permission === "granted") {
          try {
            const token = await requestForToken();
            if (token) {
              await fetch('/api/luu-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
              });
            }
          } catch (error) {
            console.error("Lỗi tự động lấy token ngầm:", error);
          }
        }
      }
    };
    autoFetchToken();
  }, []);
  // -------------------------------------------------------------

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSaveDefaultView = (mode) => {
    localStorage.setItem("defaultViewMode", mode);
    setDefaultView(mode);
    addToast(`Đã lưu mặc định: Xem theo ${mode === 'day' ? 'Ngày' : 'Tuần'}`, "success");
  };

  const toggleNoti = (id) => {
    const newNotis = notis.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n);
    setNotis(newNotis);
    localStorage.setItem("notiSettings", JSON.stringify(newNotis));
    addToast(`Đã ${newNotis.find(n => n.id === id).enabled ? 'bật' : 'tắt'} thông báo khung giờ này`, "success");
  };

  const [formData, setFormData] = useState({
    tenKhach: "", sdt: "", loaiXe: "", taiXe: "",
    ngayThue: "", gioThue: "", gia: "", ghiChu: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = ["tenKhach", "loaiXe", "ngayThue"];
    let newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsSubmitting(true);
    addToast("Đang lưu thông tin...", "success");

    try {
      const dateObj = new Date(formData.ngayThue);
      const thu = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateObj.getDay()];

      const payload = {
        ngay: formData.ngayThue, thu,
        tenKhachHang: formData.tenKhach, soDienThoai: formData.sdt,
        loaiXe: formData.loaiXe, taiXe: formData.taiXe,
        gio: formData.gioThue, gia: formData.gia, ghiChu: formData.ghiChu
      };

      const response = await fetch('/api/dat-lich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        addToast("Lưu thành công!", "success");
        setFormData({ tenKhach: "", sdt: "", loaiXe: "", taiXe: "", ngayThue: "", gioThue: "", gia: "", ghiChu: "" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addToast("Lỗi: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ĐOẠN ĐÃ SỬA: Hàm kích hoạt và lưu token bằng nút bấm ---
  const handleEnableNotification = async () => {
    try {
      addToast("Đang kết nối để xin quyền...", "success"); 
      const token = await requestForToken();
      if (token) {
        // Gửi token thu được lên API để lưu vào Google Sheets
        await fetch('/api/luu-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        addToast("Đã bật thông báo thành công!", "success");
      } else {
        addToast("Từ chối nhận thông báo hoặc không hỗ trợ.", "error");
      }
    } catch (error) {
      addToast(`Lỗi: ${error.message}`, "error"); 
    }
  };
  // -----------------------------------------------------------

  return (
    <main className="min-h-[100dvh] w-full bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden flex-col">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        <div className="relative z-10 -mb-[1px]">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="bg-white shadow-2xl p-6 sm:p-8 border border-white rounded-[1.5rem] relative z-0 transition-all duration-500 overflow-hidden pb-12">
          {activeTab === "dat-lich" && (
            <DatLich formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} isSubmitting={isSubmitting} />
          )}
          {activeTab === "xem-lich" && <XemLich />}
          {activeTab === "thong-ke" && <ThongKe />}
          {activeTab === "tim-kiem" && <TimKiem />}
        </div>
      </div>

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-2.5 bg-white/40 backdrop-blur-md border border-white/50 shadow-sm rounded-full text-slate-600 opacity-50 hover:opacity-100 hover:bg-white/70 active:scale-95 transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSettingsOpen(false)}
      ></div>

      <div 
        className={`fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white rounded-t-3xl shadow-2xl z-[70] transform transition-transform duration-300 ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="p-6 pt-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Cài đặt</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <span className="font-bold text-slate-700">Thông báo nhắc lịch</span>
              </div>
              
              <div className="space-y-3">
                {notis.map((noti) => (
                  <div key={noti.id} className="flex items-center justify-between bg-white p-3 px-4 rounded-xl border border-slate-200/60 shadow-sm">
                    <span className="font-bold text-slate-600 text-sm">{noti.label}</span>
                    <button 
                      onClick={() => toggleNoti(noti.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${noti.enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${noti.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => { handleEnableNotification(); setIsSettingsOpen(false); }}
                className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
              >
                Kích hoạt hệ thống thông báo
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="font-bold text-slate-700">Chế độ xem mặc định</span>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 gap-1">
                <button 
                  onClick={() => handleSaveDefaultView("day")}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${defaultView === 'day' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  Theo Ngày
                </button>
                <button 
                  onClick={() => handleSaveDefaultView("week")}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${defaultView === 'week' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  Theo Tuần
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center pb-4 text-[10px] text-slate-300 uppercase tracking-widest">Phiên bản 2.0.2</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </main>
  );
}