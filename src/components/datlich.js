export default function DatLich({ formData, handleChange, handleSubmit, errors }) {
  // Class dùng chung cho tất cả input để đảm bảo kích thước bằng nhau tuyệt đối
  const inputBaseClass = "w-full border rounded-2xl p-3 outline-none focus:border-blue-500 text-black bg-white transition-all box-border block appearance-none";

  return (
    <form className="space-y-3 animate-fade-in text-sm" onSubmit={handleSubmit} noValidate>
      
      {/* 1. Tên khách */}
      <div className="w-full">
        <input 
          type="text" name="tenKhach" placeholder="Tên khách *"
          value={formData.tenKhach} onChange={handleChange}
          className={`${inputBaseClass} ${errors.tenKhach ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} 
        />
      </div>

      {/* 2. Số điện thoại */}
      <div className="w-full">
        <input 
          type="tel" name="sdt" placeholder="Số điện thoại"
          value={formData.sdt} onChange={handleChange}
          className={`${inputBaseClass} border-gray-300`} 
        />
      </div>

      {/* 3. HÀNG CHỌN XE VÀ TÀI XẾ */}
      <div className="flex gap-2 w-full">
        <div className="flex-[1.5] min-w-0">
          <select
            name="loaiXe"
            value={formData.loaiXe}
            onChange={handleChange}
            className={`${inputBaseClass} cursor-pointer pr-8 ${errors.loaiXe ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">Chọn xe *</option>
            <option value="sd4T">Xe 4 chỗ (Thái)</option>
            <option value="sd4H">Xe 4 chỗ (Học)</option>
            <option value="suv7T">Xe 7 chỗ (Toyota)</option>
            <option value="suv7M">Xe 7 chỗ (Mitsubishi)</option>
          </select>
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text" name="taiXe" placeholder="Tài xế"
            value={formData.taiXe} onChange={handleChange}
            className={`${inputBaseClass} border-gray-300`}
          />
        </div>
      </div>

      {/* 4. NGÀY THUÊ - FIX LỖI LỒI VIỀN */}
      <div className="w-full">
        <input
          type="date" name="ngayThue"
          value={formData.ngayThue} onChange={handleChange}
          className={`${inputBaseClass} ${errors.ngayThue ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          style={{ width: '100%', maxWidth: '100%' }} // Ép cứng chiều rộng
        />
      </div>

      {/* 5. GIỜ THUÊ - FIX LỖI LỒI VIỀN */}
      <div className="w-full">
        <input
          type="time" name="gioThue"
          value={formData.gioThue} onChange={handleChange}
          className={`${inputBaseClass} border-gray-300`}
          style={{ width: '100%', maxWidth: '100%' }} // Ép cứng chiều rộng
        />
      </div>

      {/* 6. Giá */}
      <div className="w-full">
        <input 
          type="text" name="gia" placeholder="Giá"
          value={formData.gia} onChange={handleChange}
          className={`${inputBaseClass} border-gray-300`} 
        />
      </div>

      {/* 7. Ghi chú */}
      <div className="w-full">
        <input 
          type="text" name="ghiChu" placeholder="Ghi chú (Tùy chọn)"
          value={formData.ghiChu} onChange={handleChange}
          className={`${inputBaseClass} border-gray-300`} 
        />
      </div>

      {/* 8. Nút Lưu */}
      <div className="w-full pt-1">
        <button 
          type="submit" 
          className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase text-[12px] tracking-widest antialiased"
        >
          Lưu thông tin
        </button>
      </div>
    </form>
  );
}