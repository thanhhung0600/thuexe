"use client";
import { useState, useMemo } from "react";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ==========================================
  // THÔNG SỐ VÀNG ĐỂ Ô TRẮNG ÔM HẾT 4 CHẤM
  const oRong = "35px"; 
  const oCao = "50px";  // Tăng lên 52px để phủ hoàn toàn phần dưới
  // ==========================================

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

  const goPrevWeek = () => {
    const newDate = new Date(currentWeekAnchor);
    newDate.setDate(currentWeekAnchor.getDate() - 7);
    setCurrentWeekAnchor(newDate);
  };
  const goNextWeek = () => {
    const newDate = new Date(currentWeekAnchor);
    newDate.setDate(currentWeekAnchor.getDate() + 7);
    setCurrentWeekAnchor(newDate);
  };
  const goToday = () => {
    const today = new Date();
    setCurrentWeekAnchor(today);
    setSelectedDate(today);
  };

  const getVNDayName = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()];
  };

  const isSameDay = (d1, d2) => 
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  return (
    <div className="flex flex-col bg-white font-sans animate-fade-in overflow-visible pt-0 relative z-0">
      
      {/* THANH LỊCH NGANG */}
      <div className="mx-0 mt-0 bg-gray-100/80 rounded-2xl p-1 flex items-center justify-between relative z-20 overflow-visible border border-gray-200/40">
        
        {/* Nút lùi */}
        <button onClick={goPrevWeek} className="flex items-center justify-center w-7 h-9 text-gray-500 hover:text-blue-600 transition-all active:scale-75 bg-white/50 hover:bg-white rounded-xl shadow-sm border border-white">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dãy 7 ngày */}
        <div className="flex flex-1 justify-center gap-0.5 px-1 items-center h-12 relative overflow-visible">
          {daysInWeek.map((dateItem, idx) => {
            const active = isSameDay(dateItem, selectedDate);
            return (
              <button 
                key={idx}
                onClick={() => setSelectedDate(dateItem)}
                className="flex flex-col items-center justify-center flex-1 min-w-0 max-w-[42px] h-full relative outline-none"
              >
                {/* HÌNH CHỮ NHẬT TRẮNG (BACKGROUND ACTIVE) */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 bg-white shadow-[0_6px_20px_rgba(0,0,0,0.1)] rounded-xl transition-all duration-500 z-0
                  ${active 
                    ? "opacity-100 scale-105 -translate-y-[-0.5px]" 
                    : "opacity-0 scale-75 translate-y-0 pointer-events-none"}`}
                  style={{ 
                    width: oRong, 
                    height: oCao,
                    bottom: '0',
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />

                {/* NỘI DUNG CHỮ & DẤU CHẤM */}
                <div className="relative z-10 flex flex-col items-center pb-3">
                  <span className={`text-[12px] font-[800] leading-none transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-900"}`}>
                    {dateItem.getDate()}
                  </span>
                  <span className={`text-[7px] mt-1 font-bold uppercase tracking-tighter transition-colors duration-300 ${active ? "text-blue-500" : "text-gray-500"}`}>
                    {getVNDayName(dateItem)}
                  </span>

                  {/* 4 DẤU CHẤM: Đẩy lên cao và nằm trọn trong ô trắng */}
                  <div className="absolute -bottom-0 grid grid-cols-2 gap-[2.5px]">
                    <div className={`rounded-full bg-blue-400 transition-all duration-500 ${active ? 'w-[3.5px] h-[3.5px] opacity-100' : 'w-[3.5px] h-[3.5px] opacity-30'}`}></div>
                    <div className={`rounded-full bg-indigo-400 transition-all duration-500 ${active ? 'w-[3.5px] h-[3.5px] opacity-100' : 'w-[3.5px] h-[3.5px] opacity-30'}`}></div>
                    <div className={`rounded-full bg-teal-400 transition-all duration-500 ${active ? 'w-[3.5px] h-[3.5px] opacity-100' : 'w-[3.5px] h-[3.5px] opacity-30'}`}></div>
                    <div className={`rounded-full bg-amber-400 transition-all duration-500 ${active ? 'w-[3.5px] h-[3.5px] opacity-100' : 'w-[3.5px] h-[3.5px] opacity-30'}`}></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nút tới */}
        <button onClick={goNextWeek} className="flex items-center justify-center w-7 h-9 text-gray-500 hover:text-blue-600 transition-all active:scale-75 bg-white/50 hover:bg-white rounded-xl shadow-sm border border-white">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* DÒNG CHI TIẾT NGÀY THÁNG */}
      <div className="text-center py-2 relative z-10">
        <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </div>

      {/* KHUNG NỘI DUNG TRỐNG */}
      <div className="h-[475px] overflow-y-auto bg-gray-50/40 rounded-[1rem] mx-0 border border-gray-100 mb-2 shadow-inner custom-scrollbar relative z-0">
        <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-gray-100">
            <span className="text-3xl opacity-20">🚗</span>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.25em]">Chưa có dữ liệu</p>
        </div>
      </div>

      <div className="py-1 text-center">
        <button onClick={goToday} className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em] px-5 py-1 hover:bg-blue-50 rounded-full transition-all">Hôm nay</button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}