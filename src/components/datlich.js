"use client";
import { motion } from "framer-motion";

// BỔ SUNG isDarkMode VÀO PROPS
export default function DatLich({ formData, handleChange, handleSubmit, errors, isSubmitting, isDarkMode }) {
  
  // Tự động đổi màu nền, viền và chữ dựa vào trạng thái isDarkMode
  const inputBaseClass = `w-full border rounded-2xl p-3 outline-none focus:border-blue-500 transition-all box-border block appearance-none ${
    isDarkMode 
      ? 'bg-slate-700 text-white border-slate-600 focus:bg-slate-800 placeholder-slate-400' 
      : 'bg-white text-black border-gray-300'
  }`;

  // Màu khi người dùng nhập thiếu thông tin (Báo lỗi đỏ)
  const errorClass = isDarkMode ? 'border-red-500 bg-red-900/30' : 'border-red-500 bg-red-50';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 500, damping: 50 }
    }
  };

  return (
    <motion.form 
      className="space-y-3 text-sm" 
      onSubmit={handleSubmit} 
      noValidate
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. Tên khách */}
      <motion.div variants={itemVariants} className="w-full">
        <input 
          type="text" name="tenKhach" placeholder="Tên khách *"
          value={formData.tenKhach} onChange={handleChange}
          className={`${inputBaseClass} ${errors.tenKhach ? errorClass : ''}`} 
        />
      </motion.div>

      {/* 2. Số điện thoại */}
      <motion.div variants={itemVariants} className="w-full">
        <input 
          type="tel" name="sdt" placeholder="Số điện thoại"
          value={formData.sdt} onChange={handleChange}
          className={inputBaseClass} 
        />
      </motion.div>

      {/* 3. HÀNG CHỌN XE VÀ TÀI XẾ */}
      <motion.div variants={itemVariants} className="flex gap-2 w-full">
        <div className="flex-[1.5] min-w-0">
          <select
            name="loaiXe"
            value={formData.loaiXe}
            onChange={handleChange}
            className={`${inputBaseClass} cursor-pointer pr-8 ${errors.loaiXe ? errorClass : ''}`}
          >
            <option value="">Chọn xe *</option>
            <option value="Xe 4 (Thái)">Xe 4 chỗ(Thái)</option>
            <option value="Xe 4 (Học)">Xe 4 chỗ (Học)</option>
            <option value="Xe 7 (Mitsubishi)">Xe 7 chỗ (Mitsubishi)</option>
            <option value="Xe 8 (Toyota)">Xe 7 chỗ (Toyota)</option>
            <option value="Xe Khác">Xe Khác</option>
          </select>
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text" name="taiXe" placeholder="Tài xế"
            value={formData.taiXe} onChange={handleChange}
            className={inputBaseClass}
          />
        </div>
      </motion.div>

      {/* 4. NGÀY THUÊ */}
      <motion.div variants={itemVariants} className="w-full">
        <input
          type="date" name="ngayThue"
          value={formData.ngayThue} onChange={handleChange}
          className={`${inputBaseClass} ${errors.ngayThue ? errorClass : ''}`}
          style={{ width: '100%', maxWidth: '100%' }}
        />
      </motion.div>

      {/* 5. GIỜ THUÊ */}
      <motion.div variants={itemVariants} className="w-full">
        <input
          type="time" name="gioThue"
          value={formData.gioThue} onChange={handleChange}
          className={inputBaseClass}
          style={{ width: '100%', maxWidth: '100%' }}
        />
      </motion.div>

      {/* 6. Giá */}
      <motion.div variants={itemVariants} className="w-full">
        <input 
          type="text" name="gia" placeholder="Giá"
          value={formData.gia} onChange={handleChange}
          className={inputBaseClass} 
        />
      </motion.div>

      {/* 7. Ghi chú */}
      <motion.div variants={itemVariants} className="w-full">
        <input 
          type="text" name="ghiChu" placeholder="Ghi chú (Tùy chọn)"
          value={formData.ghiChu} onChange={handleChange}
          className={inputBaseClass} 
        />
      </motion.div>

      {/* 8. Nút Lưu */}
      <motion.div variants={itemVariants} className="w-full pt-1">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all uppercase text-[12px] tracking-widest antialiased 
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed opacity-70 text-white' 
              : 'bg-[#3b82f6] hover:bg-blue-600 text-white active:scale-95'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </span>
          ) : (
            "Lưu thông tin"
          )}
        </button>
      </motion.div>
    </motion.form>
  );
}