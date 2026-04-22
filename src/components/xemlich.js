"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const oRong = 38; 
  const oCao = 55; 
  const doDayLen = 0.5; 

  // Hàm gọi dữ liệu qua API nội bộ (Next.js API Route)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Thêm Date.now() để chống cache, đảm bảo luôn lấy dữ liệu mới nhất
      const response = await fetch(`/api/get-lich?v=${Date.now()}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllRentals(data);
      } else {
        console.error("Dữ liệu trả về không phải là mảng hợp lệ", data);
        setAllRentals([]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu lịch trình:", error);
      setAllRentals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động lấy dữ liệu khi Component được render lần đầu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm lọc danh sách lịch trình theo ngày được chọn
  const getRentalsForDate = (target) => {
    // Chuyển đổi ngày target sang định dạng YYYY-MM-DD an toàn theo múi giờ địa phương
    const tYear = target.getFullYear();
    const tMonth = String(target.getMonth() + 1).padStart(2, '0');
    const tDay = String(target.getDate()).padStart(2, '0');
    const tStr = `${tYear}-${tMonth}-${tDay}`;

    return allRentals.filter(item => {
      const dateVal = item.ngày || item.date;
      if (!dateVal) return false;
      
      // Xử lý linh hoạt ngày có dạng DD/MM/YYYY hoặc YYYY-MM-DD từ Google Sheet
      const formattedDateVal = dateVal.includes('/') ? dateVal.split('/').reverse().join('-') : dateVal;
      const d = new Date(formattedDateVal);
      
      if (isNaN(d.getTime())) return false;

      const dYear = d.getFullYear();
      const dMonth = String(d.getMonth() + 1).padStart(2, '0');
      const dDay = String(d.getDate()).padStart(2, '0');
      const dStr = `${dYear}-${dMonth}-${dDay}`;

      return dStr === tStr;
    });
  };

  // Tính toán các ngày trong tuần hiện tại
  const daysInWeek = useMemo(() => {
    const startOfWeek = new Date(currentWeekAnchor);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [currentWeekAnchor]);

  const isSameDay = (d1, d2) => d1.toLocaleDateString() === d2.toLocaleDateString();
  const dotColors = ["bg-cyan-300", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

  // Định nghĩa hiệu ứng chuyển động cho Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col bg-white font-sans w-full max-w-md mx-auto relative overflow-visible h-auto"
    >
      
      {/* 1. THANH LỊCH NGANG (TUẦN) */}
      <motion.div variants={itemVariants} className="mx-[-17px] mt-4 bg-gray-50 rounded-2xl p-1.5 flex items-center justify-between border border-gray-100 shadow-sm relative z-20">
        
        {/* NÚT LÙI LẠI 1 TUẦN */}
        <button 
          onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() - 7)))} 
          className="w-[26px] h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 z-30 relative active:scale-90 active:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* CÁC NGÀY TRONG TUẦN */}
        <div className="flex flex-1 justify-around items-center h-12 relative px-1">
          {daysInWeek.map((dateItem, idx) => {
            const active = isSameDay(dateItem, selectedDate);
            const rentalsForDay = getRentalsForDate(dateItem);
            const count = rentalsForDay.length;

            return (
              <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
                {/* Background nổi bật cho ngày đang chọn */}
                {active && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-[16px] z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    style={{ 
                      width: oRong, 
                      height: oCao,
                      top: `calc(50% + ${doDayLen}px)`,
                      y: "-50%"
                    }}
                  />
                )}

                <button 
                  onClick={() => setSelectedDate(dateItem)} 
                  className="relative z-10 flex flex-col items-center justify-center w-full h-full outline-none"
                >
                  <span className={`text-[14px] font-[600] transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-900"}`}>
                    {dateItem.getDate()}
                  </span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? "text-blue-500" : "text-gray-400"}`}>
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateItem.getDay()]}
                  </span>
                  
                  {/* Hiển thị số chấm tương ứng với số cuốc xe */}
                  <div className="mt-1 flex items-center justify-center h-[10px] w-full">
                    {count > 0 && (
                      count > 4 ? (
                        <div className="h-[2.5px] w-[10px] rounded-full bg-blue-400" /> 
                      ) : (
                        <div className="grid grid-cols-2 gap-[2px]">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className={`w-[3.5px] h-[3.5px] rounded-full transition-all duration-500 
                              ${i < count ? dotColors[i] : "bg-transparent"} 
                              ${active ? 'opacity-100' : 'opacity-50'}`} 
                            />
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        {/* NÚT TIẾN TỚI 1 TUẦN */}
        <button 
          onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() + 7)))} 
          className="w-[26px] h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 z-30 relative active:scale-90 active:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </motion.div>

      {/* 2. DÒNG HIỂN THỊ NGÀY THÁNG CHI TIẾT */}
      <motion.div variants={itemVariants} className="w-full text-center py-2">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </h2>
      </motion.div>

      {/* 3. KHUNG HIỂN THỊ LỊCH TRÌNH CHI TIẾT */}
      <motion.div variants={itemVariants} className="mx-[-17px] h-[420px] overflow-y-auto bg-gray-50/50 rounded-2xl shadow-inner border border-gray-100 no-scrollbar relative mb-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl animate-pulse">📅</span>
            <div className="text-[15px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">
              Đang đồng bộ dữ liệu
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <LichTrinhChiTiet data={getRentalsForDate(selectedDate)} />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* 4. FOOTER (NÚT HÔM NAY VÀ LÀM MỚI) */}
      <motion.div variants={itemVariants} className="flex items-center justify-center py-1 gap-3">
        
        {/* Nút trở về ngày hôm nay */}
        <button 
          onClick={() => { 
            const t = new Date(); 
            setCurrentWeekAnchor(t); 
            setSelectedDate(t); 
          }}
          className="px-10 py-3 bg-white border border-gray-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-md active:scale-95 transition-all hover:bg-gray-50"
        >
          Hôm nay
        </button>

        {/* Nút làm mới dữ liệu thủ công */}
        <button 
          onClick={fetchData} 
          disabled={loading}
          className={`w-11 h-11 bg-white border border-gray-100 text-gray-500 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
          <svg 
            className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </motion.div>

      {/* CSS Ẩn thanh cuộn nhưng vẫn cho phép cuộn */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </motion.div>
  );
}