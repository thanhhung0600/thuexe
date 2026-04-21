"use client";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const oRong = 38; 
  const oCao = 58; 
  const doDayLen = -1; 

  const URL_API = "https://script.google.com/macros/s/AKfycbyuH92oNRqbSdhx-EgCRccEEiS7Dedsm3h0zlmaNndIJq3NB2hReT8ZbU_KrYlYHQqm/exec";

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(URL_API);
      const data = await response.json();
      setAllRentals(data);
    } catch (error) {
      console.error("Lỗi cập nhật dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRentalsForDate = (target) => {
    const tStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    return allRentals.filter(item => {
      if (!item.date && !item.ngày) return false;
      const d = new Date(item.date || item.ngày);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dStr === tStr;
    });
  };

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
  const dotColors = ["bg-cyan-300", "bg-indigo-400", "bg-teal-400", "bg-amber-400"];

  return (
    // Bỏ min-h-screen để các phần sát lại nhau theo chiều dọc
    <div className="flex flex-col bg-white font-sans max-w-md mx-auto relative overflow-hidden h-auto pb-2">
      
      {/* 1. THANH LỊCH NGANG */}
      <div className="mx-4 mt-0 bg-gray-50 rounded-[24px] p-1.5 flex items-center justify-between border border-gray-100 relative z-20 shadow-sm">
        <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() - 7)))} className="w-8 h-10 flex items-center justify-center text-gray-400 z-30 relative active:scale-75 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="flex flex-1 justify-around items-center h-12 relative px-1">
          {daysInWeek.map((dateItem, idx) => {
            const active = isSameDay(dateItem, selectedDate);
            const count = getRentalsForDate(dateItem).length;

            return (
              <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
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
                  
                  <div className="mt-1 flex items-center justify-center h-[10px] w-full">
                    {count > 0 && (
                      count > 4 ? <div className="h-[2.5px] w-[10px] rounded-full bg-blue-400" /> :
                      <div className="grid grid-cols-2 gap-[2px]">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`w-[2.8px] h-[2.8px] rounded-full transition-all duration-500 
                            ${i < count ? dotColors[i] : "bg-transparent"} 
                            ${active ? 'opacity-100' : 'opacity-50'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        
        <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() + 7)))} className="w-8 h-10 flex items-center justify-center text-gray-400 z-30 relative active:scale-75 transition-transform">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* 2. DÒNG NGÀY THÁNG */}
      <div className="w-full text-center py-2">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </h2>
      </div>

      {/* 3. KHUNG NỘI DUNG CHÍNH (CỐ ĐỊNH ĐỘ CAO) */}
<div className="mx-4 h-[420px] overflow-y-auto bg-gray-50/50 rounded-[26px] shadow-inner border border-gray-100 no-scrollbar relative mb-2">
  {loading ? (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <span className="text-3xl animate-pulse">📅</span>
      <div className="text-[15px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">Đang đồng bộ dữ liệu</div>
    </div>
  ) : (
    <LichTrinhChiTiet data={getRentalsForDate(selectedDate)} />
  )}
</div>

      {/* 4. FOOTER (SÁT LỀ DƯỚI) */}
      <div className="flex items-center justify-center py-1 gap-3">
        <button 
          onClick={() => { const t = new Date(); setCurrentWeekAnchor(t); setSelectedDate(t); }}
          className="px-10 py-3 bg-white border border-gray-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-md active:scale-95 transition-all"
        >
          Hôm nay
        </button>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className={`w-11 h-11 bg-white border border-gray-100 text-gray-500 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${loading ? 'opacity-50' : ''}`}
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
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}