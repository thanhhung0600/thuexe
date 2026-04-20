"use client";
import { useState, useMemo } from "react";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    /* pt-0: Triệt tiêu padding top của container tổng */
    <div className="flex flex-col bg-white font-sans animate-fade-in overflow-visible pt-0 relative z-0">
      
      {/* KHỐI LỊCH CHÍNH: 
          - mt-0: Xóa bỏ margin top để sát lề trên.
          - p-1: Giảm padding để khối gọn hơn.
      */}
      <div className="mx-0 mt-0 bg-gray-100/80 rounded-2xl p-1 flex items-center justify-between relative z-20 overflow-visible border border-gray-200/40">
        
        {/* Nút lùi */}
        <button 
          onClick={goPrevWeek} 
          className="flex items-center justify-center w-7 h-9 text-gray-500 hover:text-blue-600 transition-all active:scale-75 bg-white/50 hover:bg-white rounded-xl shadow-sm border border-white"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Hàng 7 ngày: h-11 giúp thu hẹp chiều cao tổng thể */}
        <div className="flex flex-1 justify-between gap-1 px-1 items-center h-11 relative overflow-visible">
          {daysInWeek.map((dateItem, idx) => {
            const active = isSameDay(dateItem, selectedDate);
            return (
              <button 
                key={idx}
                onClick={() => setSelectedDate(dateItem)}
                className={`flex flex-col items-center justify-center flex-1 h-10 rounded-xl relative transition-all duration-500 ease-in-out pb-2.5 ${
                    active 
                    ? "bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] -translate-y-1 scale-105 z-50" 
                    : "bg-transparent hover:bg-white/40 z-10 opacity-100"
                  }`}
              >
                <span className={`text-[13px] font-[900] leading-none ${active ? "text-blue-600" : "text-gray-900"}`}>
                  {dateItem.getDate()}
                </span>
                <span className={`text-[7px] mt-0.5 font-bold uppercase tracking-tighter ${active ? "text-blue-500" : "text-gray-500"}`}>
                  {getVNDayName(dateItem)}
                </span>

                <div className="absolute bottom-1 grid grid-cols-2 gap-[2px]">
                  <div className={`rounded-full bg-blue-400 transition-all duration-500 ${active ? 'w-[4px] h-[4px] opacity-100' : 'w-[2px] h-[2px] opacity-30'}`}></div>
                  <div className={`rounded-full bg-indigo-400 transition-all duration-500 ${active ? 'w-[4px] h-[4px] opacity-100' : 'w-[2px] h-[2px] opacity-30'}`}></div>
                  <div className={`rounded-full bg-teal-400 transition-all duration-500 ${active ? 'w-[4px] h-[4px] opacity-100' : 'w-[2px] h-[2px] opacity-30'}`}></div>
                  <div className={`rounded-full bg-amber-400 transition-all duration-500 ${active ? 'w-[4px] h-[4px] opacity-100' : 'w-[2px] h-[2px] opacity-30'}`}></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Nút tới */}
        <button 
          onClick={goNextWeek} 
          className="flex items-center justify-center w-7 h-9 text-gray-500 hover:text-blue-600 transition-all active:scale-75 bg-white/50 hover:bg-white rounded-xl shadow-sm border border-white"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* DÒNG CHI TIẾT: Giảm py để kéo nội dung bên dưới lên gần hơn */}
      <div className="text-center py-2 relative z-10">
        <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </p>
      </div>

      {/* KHUNG NỘI DUNG */}
      <div className="h-[400px] overflow-y-auto bg-gray-50/40 rounded-[2.5rem] mx-0 border border-gray-100 mb-2 shadow-inner custom-scrollbar relative z-0">
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