"use client";
import { useState } from "react";
import DatLich from "../components/datlich";
import XemLich from "../components/xemlich";
import ToastContainer from "../components/ToastContainer";
import NavigationTabs from "../components/NavigationTabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dat-lich");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  // ✅ THÊM: Trạng thái đang gửi dữ liệu
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

  // --- HỆ THỐNG THÔNG BÁO (Toast) ---
  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // --- XỬ LÝ THAY ĐỔI INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
  };

  // --- XỬ LÝ GỬI FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Nếu đang gửi thì không cho thực hiện tiếp (Double check)
    if (isSubmitting) return;

    // 1. Kiểm tra các trường bắt buộc
    const requiredFields = ["tenKhach", "loaiXe", "ngayThue"];
    let newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Vui lòng điền đủ thông tin", "error");
      return;
    }

    // ✅ BẮT ĐẦU GỬI: Khóa nút bấm
    setIsSubmitting(true);
    addToast("Đang lưu thông tin...", "success");

    try {
      // 2. Gửi dữ liệu đến API Route nội bộ
      const response = await fetch('/api/dat-lich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      // 3. Kiểm tra phản hồi từ Server
      if (result.success) {
        addToast("Lưu thành công!", "success");
        
        // ✅ THÀNH CÔNG: Reset form về trống
        setFormData({
          tenKhach: "", sdt: "", loaiXe: "", taiXe: "",
          ngayThue: "", gioThue: "", gia: "", ghiChu: ""
        });
      } else {
        throw new Error(result.error || "Lỗi không xác định từ Google");
      }

    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      addToast("Lỗi: " + error.message, "error");
    } finally {
      // ✅ KẾT THÚC: Mở khóa nút bấm (Dù thành công hay lỗi)
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        <div className="relative z-10 -mb-[1px]">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="bg-white shadow-2xl p-6 sm:p-8 border border-gray-200 rounded-[2.5rem] relative z-0 transition-all duration-500 overflow-hidden">
          {activeTab === "dat-lich" ? (
            <DatLich 
              formData={formData} 
              handleChange={handleChange} 
              handleSubmit={handleSubmit} 
              errors={errors}
              // ✅ TRUYỀN THÊM: Trạng thái loading vào component DatLich
              isSubmitting={isSubmitting} 
            />
          ) : (
            <XemLich />
          )}
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