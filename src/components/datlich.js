export default function DatLich({ formData, handleChange, handleSubmit, errors }) {
  return (
    <form className="space-y-3 animate-fade-in text-sm" onSubmit={handleSubmit} noValidate>
      
      {/* Tên khách */}
      <div>
        <input 
          type="text" name="tenKhach" placeholder="Tên khách *"
          value={formData.tenKhach} onChange={handleChange}
          className={`w-full border rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors ${
            errors.tenKhach ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`} 
        />
      </div>

      {/* Số điện thoại */}
      <div>
        <input 
          type="tel" name="sdt" placeholder="Số điện thoại"
          value={formData.sdt} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      {/* HÀNG 1: CHỌN XE VÀ TÀI XẾ */}
      <div className="flex gap-2 w-full">
        <div className="flex-[1.5] min-w-0">
          <select
            name="loaiXe"
            value={formData.loaiXe}
            onChange={handleChange}
            className={`w-full border rounded-2xl p-3 outline-none bg-white transition-all text-gray-700 font-medium appearance-none cursor-pointer text-[13px] ${
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
            className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium placeholder:font-medium text-[13px]"
          />
        </div>
      </div>

      {/* HÀNG 2: NGÀY VÀ GIỜ (FIX LỖI CHỒNG LÊN NHAU) */}
      <div className="flex gap-2 w-full">
        <div className="flex-[1.6] min-w-0">
          <input
            type="date" name="ngayThue"
            value={formData.ngayThue} onChange={handleChange}
            className={`w-full border rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium text-[13px] bg-white ${
              errors.ngayThue ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="time" name="gioThue"
            value={formData.gioThue} onChange={handleChange}
            className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 transition-all text-gray-700 font-medium text-[13px] bg-white"
          />
        </div>
      </div>

      {/* Giá */}
      <div>
        <input 
          type="text" name="gia" placeholder="Giá"
          value={formData.gia} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      {/* Ghi chú */}
      <div>
        <input 
          type="text" name="ghiChu" placeholder="Ghi chú (Tùy chọn)"
          value={formData.ghiChu} onChange={handleChange}
          className="w-full border border-gray-300 rounded-2xl p-3 outline-none focus:border-blue-500 text-black placeholder:text-gray-400 transition-colors" 
        />
      </div>

      <button type="submit" className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-2xl mt-2 transition-all active:scale-95 shadow-md uppercase text-[12px] tracking-widest antialiased">
        Lưu thông tin
      </button>
    </form>
  );
}