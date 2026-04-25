"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("day"); 
  const [slideDirection, setSlideDirection] = useState(0);
  
  // State quản lý độ phóng to (zoom)
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const oRong = 38; 
  const oCao = 55; 
  const doDayLen = 0.5; 

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/get-lich?v=${Date.now()}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllRentals(data);
      } else {
        setAllRentals([]);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu lịch trình:", error);
      setAllRentals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRentalsForDate = (target) => {
    const tYear = target.getFullYear();
    const tMonth = String(target.getMonth() + 1).padStart(2, '0');
    const tDay = String(target.getDate()).padStart(2, '0');
    const tStr = `${tYear}-${tMonth}-${tDay}`;

    return allRentals.filter(item => {
      const dateVal = item.ngày || item.date;
      if (!dateVal) return false;
      
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

  const getGroupedRentalsForWeek = () => {
    const grouped = [];
    daysInWeek.forEach(day => {
      const rentals = getRentalsForDate(day);
      if (rentals.length > 0) {
        grouped.push({ date: day, rentals });
      }
    });
    return grouped;
  };

  const isSameDay = (d1, d2) => d1.toLocaleDateString() === d2.toLocaleDateString();
  const dotColors = ["bg-cyan-300", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

  // ==========================================
  // XỬ LÝ VUỐT (SWIPE) & PHÓNG TO (PINCH) THÔNG MINH
  // ==========================================
  const minSwipeDistance = 50; 

  const [weekTouchStart, setWeekTouchStart] = useState(null);
  const [weekTouchEnd, setWeekTouchEnd] = useState(null);

  const onWeekTouchStart = (e) => {
    setWeekTouchEnd(null);
    setWeekTouchStart(e.targetTouches[0].clientX);
  };
  const onWeekTouchMove = (e) => setWeekTouchEnd(e.targetTouches[0].clientX);
  const onWeekTouchEnd = () => {
    if (!weekTouchStart || !weekTouchEnd) return;
    const distance = weekTouchStart - weekTouchEnd;
    
    if (distance > minSwipeDistance) {
      const nextWeek = new Date(currentWeekAnchor);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentWeekAnchor(nextWeek);
    } else if (distance < -minSwipeDistance) {
      const prevWeek = new Date(currentWeekAnchor);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentWeekAnchor(prevWeek);
    }
  };

  const [contentTouchStart, setContentTouchStart] = useState({ x: null, y: null });
  const [contentTouchEnd, setContentTouchEnd] = useState({ x: null, y: null });
  const [initialPinchDistance, setInitialPinchDistance] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false); 

  const syncWeekWithDay = (newDate) => {
    const start = daysInWeek[0].setHours(0,0,0,0);
    const end = daysInWeek[6].setHours(0,0,0,0);
    const target = newDate.setHours(0,0,0,0);
    if (target < start || target > end) {
      setCurrentWeekAnchor(new Date(newDate));
    }
  };

  const onContentTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setInitialPinchDistance(Math.sqrt(dx * dx + dy * dy));
      setIsScrolling(false);
    } else if (e.touches.length === 1) {
      setContentTouchEnd({ x: null, y: null });
      setContentTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsScrolling(false);
    }
  };

  const onContentTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setScale(Math.min(Math.max(1, distance / initialPinchDistance), 1.5)); 
    } else if (e.touches.length === 1 && scale === 1) {
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      if (contentTouchStart.x !== null && contentTouchStart.y !== null) {
        const diffX = contentTouchStart.x - currentX;
        const diffY = contentTouchStart.y - currentY;

        if (Math.abs(diffY) > Math.abs(diffX)) {
          setIsScrolling(true);
        }
      }
      setContentTouchEnd({ x: currentX, y: currentY });
    }
  };
  
  const onContentTouchEnd = () => {
    if (scale > 1) {
       // Xóa đi đoạn tự reset để giữ scale khi buông tay
       setInitialPinchDistance(null);
       return;
    }

    if (isScrolling || !contentTouchStart.x || !contentTouchEnd.x) {
      setContentTouchStart({ x: null, y: null });
      setContentTouchEnd({ x: null, y: null });
      setIsScrolling(false);
      return;
    }

    const distance = contentTouchStart.x - contentTouchEnd.x;
    
    if (distance > minSwipeDistance) {
      setSlideDirection(1); 
      if (viewMode === "day") {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
        syncWeekWithDay(nextDay);
      } else {
        const nextWeek = new Date(currentWeekAnchor);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeekAnchor(nextWeek);
      }
    } else if (distance < -minSwipeDistance) {
      setSlideDirection(-1); 
      if (viewMode === "day") {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay);
        syncWeekWithDay(prevDay);
      } else {
        const prevWeek = new Date(currentWeekAnchor);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeekAnchor(prevWeek);
      }
    }

    setContentTouchStart({ x: null, y: null });
    setContentTouchEnd({ x: null, y: null });
    setIsScrolling(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
  };

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : direction < 0 ? -50 : 0, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : direction > 0 ? -50 : 0, opacity: 0 })
  };

  const groupedWeekData = getGroupedRentalsForWeek();
  const dayData = getRentalsForDate(selectedDate);

  const startDayFormat = `${String(daysInWeek[0].getDate()).padStart(2, '0')}/${String(daysInWeek[0].getMonth() + 1).padStart(2, '0')}`;
  const endDayFormat = `${String(daysInWeek[6].getDate()).padStart(2, '0')}/${String(daysInWeek[6].getMonth() + 1).padStart(2, '0')}`;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col w-full relative overflow-visible text-slate-800"
    >
      
      {/* 1. KHU VỰC CHUYỂN ĐỔI NGÀY/TUẦN */}
      <motion.div variants={itemVariants} className="w-full flex items-center justify-center -mt-3 mb-1.5">
        <div className="flex bg-gray-100 p-1 rounded-xl w-[200px] border border-gray-200 shadow-inner relative">
          <button 
            onClick={() => setViewMode("day")} 
            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "day" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Theo Ngày
          </button>
          <button 
            onClick={() => setViewMode("week")} 
            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "week" ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Theo Tuần
          </button>
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ease-out z-0 ${viewMode === "day" ? "left-1" : "left-[calc(50%+2px)]"}`}
          ></div>
        </div>
      </motion.div>

      {/* 2. THANH LỊCH NGÀY HOẶC TEXT TUẦN */}
      <AnimatePresence mode="wait">
        {viewMode === "day" ? (
          <motion.div 
            key="day-bar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-[-17px] bg-gray-50 rounded-2xl p-1.5 flex items-center justify-between border border-gray-100 shadow-sm relative z-20"
            onTouchStart={onWeekTouchStart}
            onTouchMove={onWeekTouchMove}
            onTouchEnd={onWeekTouchEnd}
          >
            <button 
              onClick={() => {
                const d = new Date(currentWeekAnchor);
                d.setDate(d.getDate() - 7);
                setCurrentWeekAnchor(d);
              }} 
              className="w-[26px] h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 z-30 relative active:scale-90 active:bg-gray-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="flex flex-1 justify-around items-center h-12 relative px-1 cursor-grab active:cursor-grabbing">
              {daysInWeek.map((dateItem, idx) => {
                const active = viewMode === "day" && isSameDay(dateItem, selectedDate);
                const count = getRentalsForDate(dateItem).length;

                return (
                  <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
                    {active && (
                      <motion.div 
                        layoutId="active-bg"
                        className="absolute bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-[16px] z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        style={{ width: oRong, height: oCao, top: `calc(50% + ${doDayLen}px)`, y: "-50%" }}
                      />
                    )}
                    <button 
                      onClick={() => {
                        setViewMode("day");
                        setSlideDirection(dateItem > selectedDate ? 1 : -1);
                        setSelectedDate(dateItem);
                      }} 
                      className="relative z-10 flex flex-col items-center justify-center w-full h-full outline-none"
                    >
                      <span className={`text-[14px] font-[600] transition-colors duration-300 ${active ? "text-blue-600" : "text-gray-900"}`}>{dateItem.getDate()}</span>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? "text-blue-500" : "text-gray-400"}`}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateItem.getDay()]}</span>
                      
                      <div className="mt-1 flex items-center justify-center h-[10px] w-full">
                        {count > 0 && (
                          count > 4 ? <div className="h-[2.5px] w-[10px] rounded-full bg-blue-400" /> : (
                            <div className="grid grid-cols-2 gap-[2px]">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className={`w-[3.5px] h-[3.5px] rounded-full transition-all duration-500 ${i < count ? dotColors[i] : "bg-transparent"} ${active ? 'opacity-100' : 'opacity-50'}`} />
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
            
            <button 
              onClick={() => {
                const d = new Date(currentWeekAnchor);
                d.setDate(d.getDate() + 7);
                setCurrentWeekAnchor(d);
              }} 
              className="w-[26px] h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 z-30 relative active:scale-90 active:bg-gray-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="week-text"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full text-center py-1.5"
          >
            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
              TỪ {startDayFormat} ĐẾN {endDayFormat}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TIÊU ĐỀ NGÀY CHI TIẾT */}
      <AnimatePresence>
        {viewMode === "day" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full text-center pt-2 pb-0.5"
          >
            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. KHUNG HIỂN THỊ LỊCH TRÌNH */}
      <motion.div 
        variants={itemVariants} 
        ref={containerRef}
        className={`mx-[-17px] mt-1 ${viewMode === "week" ? "h-[450px]" : "h-[410px]"} overflow-x-hidden overflow-y-auto bg-gray-50/50 rounded-2xl shadow-inner border border-gray-100 no-scrollbar relative mb-2 transition-all duration-300 touch-none`}
        onTouchStart={onContentTouchStart}
        onTouchMove={onContentTouchMove}
        onTouchEnd={onContentTouchEnd}
        onTouchCancel={onContentTouchEnd}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl animate-pulse">📅</span>
            <div className="text-[15px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">Đang đồng bộ dữ liệu</div>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={viewMode === "day" ? selectedDate.toISOString() : currentWeekAnchor.toISOString()}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="min-h-full" 
            >
              <motion.div 
                className="pb-4 px-2 pt-2 relative origin-top"
                animate={{ scale: scale }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {/* === HIỂN THỊ CHẾ ĐỘ NGÀY === */}
                {viewMode === "day" && (
                  <LichTrinhChiTiet data={dayData} />
                )}

                {/* === HIỂN THỊ CHẾ ĐỘ TUẦN === */}
                {viewMode === "week" && (
                  groupedWeekData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
                      <span className="text-4xl mb-3 grayscale opacity-60">🌴</span>
                      <span className="text-[12px] font-black uppercase tracking-widest text-slate-500">Tuần này trống lịch</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 relative">
                      {groupedWeekData.map((group) => (
                        <div key={group.date.toISOString()} className="flex flex-col gap-1.5">
                          <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md border border-gray-100 py-2 px-4 mx-1 rounded-xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-black text-slate-700 tracking-tight">
                                {group.date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                              </span>
                              {isSameDay(group.date, new Date()) && (
                                <span className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">Hôm nay</span>
                              )}
                            </div>
                            <span className="bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                              {group.rentals.length} chuyến
                            </span>
                          </div>

                          <div className="px-0 z-20">
                            <LichTrinhChiTiet data={group.rentals} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* 4. FOOTER (NÚT 1X - HÔM NAY - LÀM MỚI) */}
      <motion.div variants={itemVariants} className="flex items-center justify-center py-1 gap-3">
        
        {/* Nút 1X (Reset Zoom) - Đối xứng bên trái, chỉ hiện khi phóng to */}
        <button 
          onClick={() => {
            setScale(1);
            setInitialPinchDistance(null);
          }}
          className={`w-11 h-11 bg-white border border-gray-100 text-blue-600 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${scale > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <span className="font-black text-[14px] tracking-tighter">1X</span>
        </button>

        <button 
          onClick={() => { 
            const t = new Date(); 
            setSlideDirection(t > (viewMode === "day" ? selectedDate : currentWeekAnchor) ? 1 : -1);
            setCurrentWeekAnchor(t); 
            setSelectedDate(t); 
          }}
          className="px-10 py-3 bg-white border border-gray-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-md active:scale-95 transition-all hover:bg-gray-50"
        >
          {viewMode === "day" ? "Hôm nay" : "Tuần này"}
        </button>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className={`w-11 h-11 bg-white border border-gray-100 text-gray-500 rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </motion.div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    </motion.div>
  );
}