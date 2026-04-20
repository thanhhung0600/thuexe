"use client";
import { useState } from "react";

export default function Home() {
  // 1. Quản lý Tab
  const [activeTab, setActiveTab] = useState("dat-lich");

  // 2. Quản lý Dữ liệu Form
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

  // 3. Quản lý trạng thái lỗi (Viền đỏ)
  const [errors, setErrors] = useState({});

  // 4. Quản lý danh sách thông báo trượt (Toast)
  const [toasts, setToasts] = useState([]);

  // Hàm thêm thông báo mới (Tối đa 3 cái, tự xóa sau 3s)
  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Xử lý khi nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  // Xử lý khi nhấn nút LƯU
  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    const requiredFields = ["tenKhach", "loaiXe", "ngayThue",];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Bạn đã nhập thiếu thông tin!", "error");
      return;
    }

    // THÀNH CÔNG: Hiển thị thông báo xanh và làm sạch Form
    addToast("Lưu thành công!", "success");
    setFormData({
      tenKhach: "", sdt: "", loaiXe: "", taiXe: "",
      ngayThue: "", gioThue: "", gia: "", ghiChu: ""
    });
    setErrors({}); // Xóa bỏ các vết đỏ lỗi cũ
  };

  return (
    <div className="min-h-screen bg-[#bac4e5] flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* === KHU VỰC THÔNG BÁO TRƯỢT (TOASTS) === */}
      <div className="fixed top-6 left-1/2 z-[100] flex flex-col gap-2 w-full max-w-[320px] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${toast.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white px-6 py-3 rounded-2xl shadow-2xl font-semibold flex items-center gap-2 animate-slide-down`}
          >
            {toast.type === "success" ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            )}
            <span className="text-sm whitespace-nowrap">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">

        {/* === TABS PHÍA TRÊN === */}
        <div className="flex w-full gap-2 px-8 relative z-10 -mb-[1px]">

          {/* Tab 1: Đặt lịch */}
          <button
            onClick={() => setActiveTab("dat-lich")}
            className={`flex-1 py-3 transition-all border relative flex items-center justify-center
      /* Montserrat đẹp nhất ở text 10-11px, font-bold (700) và tracking rộng */
      text-[11px] font-bold uppercase tracking-[0.15em] antialiased
      ${activeTab === "dat-lich"
                ? "bg-white text-blue-600 border-gray-200 border-b-white rounded-t-3xl z-20 tab-curve"
                : "bg-gray-200 text-gray-500 border-transparent rounded-3xl mb-2 z-0 opacity-70"
              }`}
          >
            Đặt lịch thuê xe
          </button>

          {/* Tab 2: Lịch thuê */}
          <button
            onClick={() => setActiveTab("xem-lich")}
            className={`flex-1 py-3 transition-all border relative flex items-center justify-center
      text-[11px] font-bold uppercase tracking-[0.15em] antialiased
      ${activeTab === "xem-lich"
                ? "bg-white text-blue-600 border-gray-200 border-b-white rounded-t-3xl z-20 tab-curve"
                : "bg-gray-200 text-gray-500 border-transparent rounded-3xl mb-2 z-0 opacity-70"
              }`}
          >
            Lịch thuê
          </button>

        </div>

        {/* === KHỐI NỘI DUNG CHÍNH (MAIN CARD) === */}
        <div className="bg-white shadow-xl p-8 border border-gray-200 rounded-2xl relative z-0">

          {activeTab === "dat-lich" && (
            <form className="space-y-3 animate-fade-in text-sm" onSubmit={handleSubmit} noValidate>

              <div>
                <input type="text" name="tenKhach" placeholder="Tên khách *"
                  value={formData.tenKhach} onChange={handleChange}
                  className={`w-full border rounded-2xl p-2.5 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors ${errors.tenKhach ? 'border-red-500 bg-red-50' : 'border-gray-400'}`} />
              </div>

              <div>
                <input type="tel" name="sdt" placeholder="Số điện thoại"
                  value={formData.sdt} onChange={handleChange}
                  className={`w-full border rounded-2xl p-2.5 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors ${errors.sdt ? 'border-red-500 bg-red-50' : 'border-gray-400'}`} />
              </div>

              {/* HÀNG CHỌN XE VÀ TÀI XẾ */}
              <div className="flex gap-3">
                {/* Ô Chọn xe */}
                <div className="flex-[1.2]">
                  <select
                    name="loaiXe"
                    value={formData.loaiXe}
                    onChange={handleChange}
                    /* Đổi từ font-bold sang font-medium để chữ thanh mảnh hơn, không bị đậm/méo */
                    className={`w-full border rounded-2xl p-3 outline-none bg-white transition-all text-gray-700 font-medium appearance-none cursor-pointer ${errors.loaiXe ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Chọn xe *</option>
                    <option value="sd4T">Xe 4 chỗ (Thái)</option>
                    <option value="sd4H">Xe 4 chỗ (Học)</option>
                    <option value="suv7T">Xe 7 chỗ (Toyota)</option>
                    <option value="suv7M">Xe 7 chỗ (Mitsubishi)</option>
                  </select>
                </div>

                {/* Ô Tài xế */}
                <div className="flex-1">
                  <input
                    type="text"
                    name="taiXe"
                    placeholder="Tài xế"
                    value={formData.taiXe}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium placeholder:font-medium"
                  />
                </div>
              </div>

              {/* HÀNG NHẬP NGÀY VÀ GIỜ */}
              <div className="flex gap-3">
                {/* Ô Nhập Ngày */}
                <div className="flex-[1.2]"> {/* Ngày cần rộng hơn một chút */}
                  <input
                    type="date"
                    name="ngayThue"
                    value={formData.ngayThue}
                    onChange={handleChange}
                    className={`w-full border rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium ${errors.ngayThue ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                </div>

                {/* Ô Nhập Giờ */}
                <div className="flex-1">
                  <input
                    type="time"
                    name="gioThue"
                    value={formData.gioThue}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <input type="text" name="gia" placeholder="Giá"
                  value={formData.gia} onChange={handleChange}
                  className={`w-full border rounded-2xl p-2.5 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors ${errors.gia ? 'border-red-500 bg-red-50' : 'border-gray-400'}`} />
              </div>

              <div>
                <input type="text" name="ghiChu" placeholder="Ghi chú (Tùy chọn)"
                  value={formData.ghiChu} onChange={handleChange}
                  className="w-full border border-gray-400 rounded-2xl p-2.5 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" />
              </div>

              <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-2xl mt-4 transition-colors">
                Lưu
              </button>
            </form>
          )}

          {activeTab === "xem-lich" && (
            <div className="py-20 text-center animate-fade-in">
              <div className="text-gray-400 text-5xl mb-4">📅</div>
              <h3 className="text-lg font-bold text-gray-700">Chưa có dữ liệu</h3>
              <p className="text-sm text-gray-500 mt-2">Dữ liệu sẽ được hiển thị sau khi kết nối Google Sheets.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}