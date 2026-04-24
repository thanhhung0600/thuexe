"use client";
import ThongKe from "../components/thongke";
import TimKiem from "../components/timkiem";
import { useState } from "react";
import DatLich from "../components/datlich";
import XemLich from "../components/xemlich";
import ToastContainer from "../components/ToastContainer";
import NavigationTabs from "../components/NavigationTabs";

// Import hàm xin quyền thông báo từ file firebase.js
import { requestForToken } from "../lib/firebase";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dat-lich");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State quản lý việc đóng/mở menu cài đặt trượt từ dưới lên
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    tenKhach: "", 
    sdt: "", 
    loaiXe: "", 
    taiXe: "",
    ngayThue: "", 
    gioThue: "", 
    gia: "", 
    ghiChu: ""
  });

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    const requiredFields = ["tenKhach", "loaiXe", "ngayThue"];
    let newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsSubmitting(true);
    addToast("Đang lưu thông tin...", "success");

    let thuTieuDien = "";
    if (formData.ngayThue) {
      const dateObj = new Date(formData.ngayThue);
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      thuTieuDien = days[dateObj.getDay()];
    }

    const payload = {
      ngay: formData.ngayThue,       
      thu: thuTieuDien,              
      tenKhachHang: formData.tenKhach, 
      soDienThoai: formData.sdt,     
      loaiXe: formData.loaiXe,       
      taiXe: formData.taiXe,         
      gio: formData.gioThue,         
      gia: formData.gia,             
      ghiChu: formData.ghiChu        
    };

    try {
      const response = await fetch('/api/dat-lich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        addToast("Lưu thành công!", "success");
        setFormData({
          tenKhach: "", sdt: "", loaiXe: "", taiXe: "",
          ngayThue: "", gioThue: "", gia: "", ghiChu: ""
        });
      } else {
        throw new Error(result.error || "Lỗi không xác định từ Server");
      }

    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      addToast("Lỗi: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnableNotification = async () => {
    try {
      addToast("Đang kết nối để xin quyền...", "success"); 
      const token = await requestForToken();
      if (token) {
        prompt("Đã bật thông báo thành công! Đây là mã Token của điện thoại bạn (Hãy copy nó):", token);
      } else {
        addToast("Từ chối nhận thông báo hoặc không hỗ trợ.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast(`Lỗi: ${error.message}`, "error"); 
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden flex-col">
      <ToastContainer toasts={toasts} />

      {/* --- PHẦN NỘI DUNG CHÍNH --- */}
      <div className="w-full max-w-md relative">
        <div className="relative z-10 -mb-[1px]">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="bg-white shadow-2xl p-6 sm:p-8 border border-white rounded-[1.5rem] relative z-0 transition-all duration-500 overflow-hidden pb-12">
          {activeTab === "dat-lich" && (
            <DatLich 
              formData={formData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit} 
              errors={errors}
              isSubmitting={isSubmitting} 
            />
          )}
          {activeTab === "xem-lich" && <XemLich />}
          {activeTab === "thong-ke" && <ThongKe />}
          {activeTab === "tim-kiem" && <TimKiem />}
        </div>
      </div>

      {/* --- NÚT BÁNH RĂNG (Góc dưới bên phải) --- */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-2.5 bg-white/40 backdrop-blur-md border border-white/50 shadow-sm rounded-full text-slate-600 opacity-50 hover:opacity-100 hover:bg-white/70 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Mở cài đặt"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* --- MENU TRƯỢT TỪ DƯỚI LÊN (BOTTOM SHEET) --- */}
      {/* 1. Lớp phủ đen mờ */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSettingsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSettingsOpen(false)}
      ></div>

      {/* 2. Bảng Menu trượt */}
      <div 
        className={`fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[70] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Nút gạt nhỏ (Handle) để giả lập cảm giác vuốt của iOS */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        <div className="p-6 pt-2">
          {/* Header của Menu */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Cài đặt</h2>
            <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Mục Cài đặt Thông báo */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="font-bold text-slate-700">Thông báo đẩy</span>
              </div>
              <p className="text-xs text-slate-500 mb-4 ml-[44px]">Nhận nhắc nhở lịch trình xe vào lúc 20:00 tối mỗi ngày.</p>
              
              <button 
                onClick={() => {
                  handleEnableNotification();
                  setIsSettingsOpen(false); // Tự động đóng menu sau khi bấm để gọn gàng
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                Kích hoạt thông báo
              </button>
            </div>
          </div>
          
          <div className="text-center pb-4">
             <p className="text-[10px] text-slate-400 uppercase tracking-widest">Phiên bản 2.0.1</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slideDown 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </main>
  );
}