export default function DatLich({ formData, handleChange, handleSubmit, errors }) {
  return (
    <form className="space-y-3 animate-fade-in text-sm" onSubmit={handleSubmit} noValidate>
      
      {/* 1. Tên khách */}
      <div>
        <input 
          type="text" name="tenKhach" placeholder="Tên khách *"
          value={formData.tenKhach} onChange={handleChange}
          className={`w-full border rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors ${
            errors.tenKhach ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`} 
        />
      </div>

      {/* 2. Số điện thoại */}
      <div>
        <input 
          type="tel" name="sdt" placeholder="Số điện thoại"
          value={formData.sdt} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      {/* 3. HÀNG CHỌN XE VÀ TÀI XẾ (GIỮ 1 DÒNG) */}
      <div className="flex gap-2 w-full">
        <div className="flex-[1.5] min-w-0">
          <select
            name="loaiXe"
            value={formData.loaiXe}
            onChange={handleChange}
            className={`w-full border rounded-2xl p-3 outline-none bg-white transition-all text-gray-700 font-medium appearance-none cursor-pointer ${
              errors.loaiXe ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
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
            className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium"
          />
        </div>
      </div>

      {/* 4. NGÀY THUÊ (TÁCH RIÊNG 1 DÒNG) */}
      <div>
        <input
          type="date" name="ngayThue"
          value={formData.ngayThue} onChange={handleChange}
          className={`w-full border rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium bg-white ${
            errors.ngayThue ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
      </div>

      {/* 5. GIỜ THUÊ (TÁCH RIÊNG 1 DÒNG) */}
      <div>
        <input
          type="time" name="gioThue"
          value={formData.gioThue} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium bg-white"
        />
      </div>

      {/* 6. Giá */}
      <div>
        <input 
          type="text" name="gia" placeholder="Giá"
          value={formData.gia} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      {/* 7. Ghi chú */}
      <div>
        <input 
          type="text" name="ghiChu" placeholder="Ghi chú (Tùy chọn)"
          value={formData.ghiChu} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      {/* 8. Nút Lưu */}
      <button 
        type="submit" 
        className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl mt-2 shadow-lg active:scale-95 transition-all uppercase text-[12px] tracking-widest antialiased"
      >
        Lưu thông tin
      </button>
    </form>
  );
}