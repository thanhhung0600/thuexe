"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("day"); 
  const [slideDirection, setSlideDirection] = useState(0);
  const [currentScale, setCurrentScale] = useState(1);

  const pinchZoomRef = useRef();
  const containerRef = useRef();

  // Reset Zoom về 100%
  const handleResetZoom = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({ x: 0, y: 0, scale: 1, animated: true });
      setCurrentScale(1);
    }
  };

  const onUpdate = useCallback(({ x, y, scale }) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty("transform", value);
      setCurrentScale(scale);
    }
  }, []);

  // HÀM LẤY DỮ LIỆU CÓ KHỬ CACHE
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Thêm v=... để ép trình duyệt luôn lấy dữ liệu mới nhất sau khi xóa/sửa
      const response = await fetch(`/api/get-lich?v=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) setAllRentals(data);
      else setAllRentals([]);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      setAllRentals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const savedMode = localStorage.getItem("defaultViewMode");
    if (savedMode) setViewMode(savedMode);
  }, [fetchData]);

  const getRentalsForDate = (target) => {
    const tStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    return allRentals.filter(item => {
      const dateVal = item.ngày || item.date;
      if (!dateVal) return false;
      const formatted = dateVal.includes('/') ? dateVal.split('/').reverse().join('-') : dateVal;
      return formatted.startsWith(tStr);
    });
  };

  const daysInWeek = useMemo(() => {
    const start = new Date(currentWeekAnchor);
    const day = start.getDay();
    start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentWeekAnchor]);

  const isSameDay = (d1, d2) => d1.toLocaleDateString() === d2.toLocaleDateString();

  const minSwipeDistance = 40; 
  const [touchStart, setTouchStart] = useState(null);
  const onTouchStart = (e) => { setTouchStart(e.targetTouches[0].clientX); };

  const onTouchEnd = (e, targetType) => {
    if (!touchStart || currentScale > 1.1) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      const isNext = distance > 0;
      setSlideDirection(isNext ? 1 : -1);
      if (targetType === "week" || viewMode === "week") {
        const d = new Date(currentWeekAnchor);
        d.setDate(d.getDate() + (isNext ? 7 : -7));
        setCurrentWeekAnchor(d);
      } else {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + (isNext ? 1 : -1));
        setSelectedDate(d);
        if (d < daysInWeek[0] || d > daysInWeek[6]) setCurrentWeekAnchor(new Date(d));
      }
    }
    setTouchStart(null);
  };

  return (
    <motion.div initial="hidden" animate="visible" className="flex flex-col w-full text-slate-800">
      
      {/* 1. THANH CÔNG TẮC */}
      <div className="w-full flex justify-center mb-2 mt-0">
        <div className="flex bg-gray-100 p-1 rounded-xl w-[180px] border border-gray-200 shadow-inner relative">
          <button onClick={() => setViewMode("day")} className={`flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all z-10 ${viewMode === "day" ? "text-blue-600" : "text-gray-400"}`}>Ngày</button>
          <button onClick={() => setViewMode("week")} className={`flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all z-10 ${viewMode === "week" ? "text-blue-600" : "text-gray-400"}`}>Tuần</button>
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ${viewMode === "day" ? "left-1" : "left-[calc(50%+2px)]"}`}></div>
        </div>
      </div>

      {/* 2. THANH LỊCH NGANG */}
      <AnimatePresence>
        {viewMode === "day" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mx-[-22px] w-[calc(100%+44px)] bg-gray-50/80 backdrop-blur-sm rounded-xl p-1.5 flex items-center justify-between border border-gray-200/50 mb-2 shadow-sm"
            onTouchStart={onTouchStart} onTouchEnd={(e) => onTouchEnd(e, "week")}
          >
            <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() - 7)))} className="w-8 h-10 flex items-center justify-center text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex flex-1 justify-around items-center h-12 relative px-1">
              {daysInWeek.map((dateItem, idx) => {
                const active = isSameDay(dateItem, selectedDate);
                return (
                  <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
                    {active && <motion.div layoutId="active-bg" className="absolute bg-white shadow-md rounded-lg w-[38px] h-[52px] z-0" />}
                    <button onClick={() => setSelectedDate(dateItem)} className="relative z-10 flex flex-col items-center">
                      <span className={`text-[15px] font-bold ${active ? "text-blue-600" : "text-gray-900"}`}>{dateItem.getDate()}</span>
                      <span className={`text-[8px] font-black uppercase ${active ? "text-blue-500" : "text-gray-400"}`}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateItem.getDay()]}</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() + 7)))} className="w-8 h-10 flex items-center justify-center text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. TIÊU ĐỀ THÔNG TIN */}
      <div className="w-full flex items-center justify-between px-1 mb-1">
        <div className="w-8"></div>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
          {viewMode === "day" 
            ? selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
            : `Lịch tuần: ${daysInWeek[0].getDate()}/${daysInWeek[0].getMonth()+1} - ${daysInWeek[6].getDate()}/${daysInWeek[6].getMonth()+1}`
          }
        </h2>
        <button onClick={handleResetZoom} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${currentScale > 1 ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V20m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11-11V4m0 0h-4m4 0l-5 5" /></svg>
        </button>
      </div>

      {/* 4. KHUNG NỘI DUNG */}
      <div 
        className={`mx-[-22px] w-[calc(100%+44px)] ${viewMode === "week" ? "h-[520px]" : "h-[440px]"} relative bg-gray-50/50 rounded-2xl border border-gray-200/50 shadow-inner overflow-hidden mb-5`}
        onTouchStart={onTouchStart} onTouchEnd={(e) => onTouchEnd(e, "content")}
      >
        <QuickPinchZoom ref={pinchZoomRef} onUpdate={onUpdate} enforceBounds={true} tapZoomFactor={0}>
          <div ref={containerRef} className="w-full will-change-transform">
            <div className={`w-full ${viewMode === "week" ? "h-[520px]" : "h-[440px]"} overflow-y-auto no-scrollbar px-1.5 pt-2 pb-12`}>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full animate-pulse"><span className="text-2xl mb-2">📅</span><div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Đang đồng bộ</div></div>
              ) : (
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={viewMode === "day" ? selectedDate.toISOString() : currentWeekAnchor.toISOString()}
                    custom={slideDirection}
                    variants={{ enter: (d) => ({ x: d > 0 ? 30 : -30, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d < 0 ? 30 : -30, opacity: 0 }) }}
                    initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}
                  >
                    {viewMode === "day" ? (
                      <LichTrinhChiTiet data={getRentalsForDate(selectedDate)} onRefresh={fetchData} />
                    ) : (
                      <div className="flex flex-col gap-6">
                        {daysInWeek.map((d, i) => {
                           const rentals = getRentalsForDate(d);
                           if (rentals.length === 0) return null;
                           return (
                             <div key={i} className="flex flex-col gap-3">
                               <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border border-blue-50 py-2 px-4 rounded-xl flex items-center justify-between shadow-sm mx-1">
                                  <span className="text-[13px] font-black text-slate-700 tracking-tight">{d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">{rentals.length} chuyến</span>
                               </div>
                               <LichTrinhChiTiet data={rentals} onRefresh={fetchData} />
                             </div>
                           )
                        })}
                        {allRentals.length > 0 && getRentalsForDate(daysInWeek[0]).length === 0 && (
                           <div className="flex flex-col items-center justify-center h-[300px] opacity-40"><span className="text-4xl mb-2">🌴</span><span className="text-[11px] font-black uppercase tracking-widest">Trống lịch tuần này</span></div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </QuickPinchZoom>
      </div>

      {/* 5. FOOTER */}
      <div className="flex items-center justify-center gap-5 pb-4">
        <button onClick={() => { const t = new Date(); setCurrentWeekAnchor(t); setSelectedDate(t); handleResetZoom(); }} className="px-14 py-4 bg-white border border-gray-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.25em] rounded-full shadow-lg active:scale-95 transition-all">Hôm nay</button>
        <button onClick={fetchData} className="w-12 h-12 bg-white border border-gray-100 text-slate-400 rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-all">
          <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <style jsx>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </motion.div>
  );
}