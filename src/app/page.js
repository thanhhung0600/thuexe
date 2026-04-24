"use client";
import ThongKe from "../components/thongke";
import TimKiem from "../components/timkiem";
import { useState } from "react";
import DatLich from "../components/datlich";
import XemLich from "../components/xemlich";
import ToastContainer from "../components/ToastContainer";
import NavigationTabs from "../components/NavigationTabs";

// THÊM: Import hàm xin quyền thông báo từ file firebase.js
import { requestForToken } from "../lib/firebase";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dat-lich");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // THÊM: Hàm xử lý khi bấm nút "Bật Thông Báo"
  const handleEnableNotification = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        // Dùng lệnh prompt để hiển thị hộp thoại cho phép bạn COPY mã Token dễ dàng
        prompt("Đã bật thông báo thành công! Đây là mã Token của điện thoại bạn (Hãy copy nó):", token);
      } else {
        addToast("Bạn đã từ chối nhận thông báo hoặc trình duyệt không hỗ trợ.", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Có lỗi xảy ra khi xin quyền thông báo.", "error");
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden flex-col">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        <div className="relative z-10 -mb-[1px]">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="bg-white shadow-2xl p-6 sm:p-8 border border-white rounded-[1.5rem] relative z-0 transition-all duration-500 overflow-hidden">
          {activeTab === "dat-lich" && (
            <DatLich 
              formData={formData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit} 
              errors={errors}
              isSubmitting={isSubmitting} 
            />
          )}
          
          {activeTab === "xem-lich" && (
            <XemLich />
          )}

          {activeTab === "thong-ke" && (
            <ThongKe />
          )}

          {activeTab === "tim-kiem" && (
            <TimKiem />
          )}
        </div>

        {/* THÊM: Nút bấm Bật Thông Báo & Lấy Token */}
        <button
          onClick={handleEnableNotification}
          className="w-full mt-4 bg-white/40 border border-white/60 text-slate-700 font-black py-4 rounded-2xl shadow-sm hover:bg-white/60 active:scale-95 transition-all text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-sm"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Lấy mã thông báo điện thoại
        </button>

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