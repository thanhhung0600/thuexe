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
  const [formData, setFormData] = useState({
    tenKhach: "", sdt: "", loaiXe: "", taiXe: "",
    ngayThue: "", gioThue: "", gia: "", ghiChu: ""
  });

  // Logic xử lý (Giữ nguyên)
  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tenKhach || !formData.loaiXe || !formData.ngayThue) {
      setErrors({ tenKhach: !formData.tenKhach, loaiXe: !formData.loaiXe, ngayThue: !formData.ngayThue });
      return addToast("Bạn đã nhập thiếu thông tin!");
    }
    addToast("Lưu thành công!", "success");
    setFormData({ tenKhach: "", sdt: "", loaiXe: "", taiXe: "", ngayThue: "", gioThue: "", gia: "", ghiChu: "" });
  };

  return (
    /* CHỈNH SỬA 1: Đổi overflow-hidden thành overflow-y-visible và thêm pt-10 
       để có không gian cho component nhô lên không bị cấn lề màn hình */
    <div className="min-h-screen bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-y-visible pt-12">
      
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* CHỈNH SỬA 2: Thêm overflow-visible để XemLich có thể hiển thị phần nhô cao 
            Thay đổi p-8 thành pt-10 pb-8 để cân bằng lại khoảng cách phía trên */}
        <div className="bg-white shadow-xl pt-10 pb-8 px-8 border border-gray-200 rounded-3xl relative z-10 overflow-visible">
          {activeTab === "dat-lich" ? (
            <DatLich formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} />
          ) : (
            <div className="overflow-visible">
               <XemLich />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}