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

  // ĐÃ SỬA: Hàm xử lý bắt bệnh lỗi xin quyền
  const handleEnableNotification = async () => {
    try {
      addToast("Đang kết nối để xin quyền...", "success"); // Báo hiệu đang chạy
      const token = await requestForToken();
      if (token) {
        prompt("Đã bật thông báo thành công! Đây là mã Token của điện thoại bạn (Hãy copy nó):", token);
      } else {
        addToast("Từ chối nhận thông báo hoặc không hỗ trợ.", "error");
      }
    } catch (error) {
      console.error(error);
      // Hiển thị trực tiếp nội dung lỗi ra màn hình để chúng ta biết bị kẹt ở đâu
      addToast(`Lỗi: ${error.message}`, "error"); 
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden flex-col">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        
        {/* --- ĐÃ SỬA: Xếp Tabs và Nút Chuông lên cùng 1 dòng --- */}
        <div className="relative z-10 -mb-[1px] flex items-end justify-between gap-2">
          
          {/* Khu vực Tabs chiếm phần lớn chiều rộng */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Nút Chuông Thông Báo được thiết kế lại thành hình vuông bo góc nằm bên phải */}
          <button
            onClick={handleEnableNotification}
            className="mb-[1px] h-10 w-10 shrink-0 bg-white/80 backdrop-blur-md shadow-sm border-t border-l border-r border-white/60 rounded-t-xl text-blue-600 hover:text-blue-800 hover:bg-white active:scale-95 transition-all flex items-center justify-center relative group"
            title="Đăng ký nhận thông báo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {/* Hiệu ứng chấm đỏ thông báo nhỏ góc trên */}
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
        {/* ---------------------------------------------------- */}

        <div className="bg-white shadow-2xl p-6 sm:p-8 border border-white rounded-b-[1.5rem] rounded-tl-[1.5rem] relative z-0 transition-all duration-500 overflow-hidden">
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