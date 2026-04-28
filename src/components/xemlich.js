"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGesture } from "@use-gesture/react"; 
import LichTrinhChiTiet from "./LichTrinhChiTiet";

// ĐÃ THÊM 2 PROPS TỪ BẢNG CÀI ĐẶT: hidePastTrips, isDarkMode
export default function XemLich({ hidePastTrips, isDarkMode }) {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("day"); 
  const [slideDirection, setSlideDirection] = useState(0);
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const scrollContainerRef = useRef(null);
  const todayRef = useRef(null);

  const oRong = 38; 
  const oCao = 55; 
  const doDayLen = 0.5; 

  useEffect(() => {
    const savedMode = localStorage.getItem("defaultViewMode");
    if (savedMode === "week" || savedMode === "day") {
      setViewMode(savedMode);
    }
  }, []);

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

      // --- LOGIC ẨN CHUYẾN ĐI CŨ TỪ BẢNG CÀI ĐẶT ---
      if (hidePastTrips) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkD = new Date(d);
        checkD.setHours(0, 0, 0, 0);
        if (checkD < today) return false; // Lọc bỏ nếu ngày của chuyến xe nhỏ hơn hôm nay
      }
      // ----------------------------------------------

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

  const syncWeekWithDay = (newDate) => {
    const start = daysInWeek[0].setHours(0,0,0,0);
    const end = daysInWeek[6].setHours(0,0,0,0);
    const target = newDate.setHours(0,0,0,0);
    if (target < start || target > end) {
      setCurrentWeekAnchor(new Date(newDate));
    }
  };

  const handleDateChange = (direction) => {
    setSlideDirection(direction);
    if (viewMode === "day") {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + direction);
      setSelectedDate(nextDay);
      syncWeekWithDay(nextDay);
    } else {
      const nextWeek = new Date(currentWeekAnchor);
      nextWeek.setDate(nextWeek.getDate() + (direction * 7));
      setCurrentWeekAnchor(nextWeek);
    }
  };

  useEffect(() => {
    if (viewMode === "week" && !loading && scale === 1) {
      const timer = setTimeout(() => {
        if (todayRef.current && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const targetElement = todayRef.current;
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          container.scrollBy({ top: targetRect.top - containerRect.top - 15, behavior: 'smooth' });
        }
      }, 350); 
      return () => clearTimeout(timer);
    }
  }, [viewMode, loading, currentWeekAnchor, scale]);

  const bindWeekBar = useGesture({
    onDrag: ({ active, direction: [dx], distance: [distX] }) => {
      if (!active && distX > 40) {
        const dir = dx > 0 ? -7 : 7; 
        const nextWeek = new Date(currentWeekAnchor);
        nextWeek.setDate(nextWeek.getDate() + dir);
        setCurrentWeekAnchor(nextWeek);
      }
    }
  }, { drag: { axis: 'x' } }); 

  const bindContent = useGesture({
    onDrag: ({ active, movement: [mx, my], direction: [dx], distance: [distX] }) => {
      if (scale > 1) {
        setPan({ x: mx, y: my });
      } else {
        if (!active && distX > 60) {
          handleDateChange(dx > 0 ? -1 : 1);
        }
      }
    },
    onPinch: ({ offset: [s] }) => {
      setScale(s);
      if (s === 1) setPan({ x: 0, y: 0 }); 
    }
  }, {
    drag: { axis: scale === 1 ? 'x' : undefined, from: () => [pan.x, pan.y], filterTaps: true },
    pinch: { scaleBounds: { min: 1, max: 2 }, modifierKey: 'shift' } 
  });

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
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
      className={`flex flex-col w-full relative overflow-visible ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
    >
      
      <motion.div variants={itemVariants} className="w-full flex items-center justify-center -mt-3 mb-1.5">
        <div className={`flex p-1 rounded-xl w-[200px] border shadow-inner relative transition-colors ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-gray-100 border-gray-200'}`}>
          <button 
            onClick={() => { setViewMode("day"); localStorage.setItem("defaultViewMode", "day"); }} 
            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "day" ? (isDarkMode ? "text-blue-400" : "text-blue-600") : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600")}`}
          >
            Theo Ngày
          </button>
          <button 
            onClick={() => { setViewMode("week"); localStorage.setItem("defaultViewMode", "week"); }} 
            className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "week" ? (isDarkMode ? "text-blue-400" : "text-blue-600") : (isDarkMode ? "text-slate-400 hover:text-slate-200" : "text-gray-400 hover:text-gray-600")}`}
          >
            Theo Tuần
          </button>
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm border transition-all duration-300 ease-out z-0 ${viewMode === "day" ? "left-1" : "left-[calc(50%+2px)]"} ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-100'}`}
          ></div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "day" ? (
          <motion.div 
            {...bindWeekBar()} 
            key="day-bar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`mx-[-17px] rounded-2xl p-1.5 flex items-center justify-between border shadow-sm relative z-20 touch-pan-y transition-colors ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-gray-50 border-gray-100'}`}
          >
            <button 
              key="btn-prev"
              onClick={() => handleDateChange(-7)} 
              className={`w-[26px] h-10 border shadow-sm rounded-xl flex items-center justify-center z-30 relative active:scale-90 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-gray-200 text-gray-500 active:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div key="days-container" className="flex flex-1 justify-around items-center h-12 relative px-1 cursor-grab active:cursor-grabbing">
              {daysInWeek.map((dateItem, idx) => {
                const active = viewMode === "day" && isSameDay(dateItem, selectedDate);
                const count = getRentalsForDate(dateItem).length;

                return (
                  <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
                    {active && (
                      <motion.div 
                        layoutId="active-bg"
                        className={`absolute rounded-[16px] z-0 ${isDarkMode ? 'bg-slate-600 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-slate-500' : 'bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]'}`}
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
                      <span className={`text-[14px] font-[600] transition-colors duration-300 ${active ? (isDarkMode ? "text-blue-300" : "text-blue-600") : (isDarkMode ? "text-slate-300" : "text-gray-900")}`}>{dateItem.getDate()}</span>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? "text-blue-500" : (isDarkMode ? "text-slate-500" : "text-gray-400")}`}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateItem.getDay()]}</span>
                      
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
              key="btn-next"
              onClick={() => handleDateChange(7)} 
              className={`w-[26px] h-10 border shadow-sm rounded-xl flex items-center justify-center z-30 relative active:scale-90 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' : 'bg-white border-gray-200 text-gray-500 active:bg-gray-50'}`}
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

      <AnimatePresence>
        {viewMode === "day" && (
          <motion.div 
            key="date-title-block" 
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

      <motion.div 
        {...bindContent()} 
        variants={itemVariants} 
        ref={scrollContainerRef}
        className={`mx-[-17px] mt-1 ${viewMode === "week" ? "h-[450px]" : "h-[410px]"} overflow-x-hidden overflow-y-auto rounded-2xl shadow-inner border no-scrollbar relative mb-2 transition-colors duration-300 touch-pan-y ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-gray-50/50 border-gray-100'}`}
        style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }} 
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl animate-pulse">📅</span>
            <div className={`text-[15px] font-black uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Đang đồng bộ dữ liệu</div>
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
                className="pb-4 px-2 pt-2 relative origin-center"
                animate={{ scale: scale, x: pan.x, y: pan.y }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {viewMode === "day" && (
                  <LichTrinhChiTiet data={dayData} onRefresh={fetchData} isDarkMode={isDarkMode} />
                )}

                {viewMode === "week" && (
                  groupedWeekData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] opacity-50">
                      <span className="text-4xl mb-3 grayscale opacity-60">🌴</span>
                      <span className={`text-[12px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tuần này trống lịch</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5 relative">
                      {groupedWeekData.map((group) => {
                        const isToday = isSameDay(group.date, new Date());
                        return (
                          <div 
                            key={group.date.toISOString()} 
                            ref={isToday ? todayRef : null} 
                            className="flex flex-col gap-1.5"
                          >
                            <div className={`sticky top-2 z-30 backdrop-blur-md border py-2 px-4 mx-1 rounded-xl flex items-center justify-between shadow-sm transition-colors ${isDarkMode ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-gray-100'}`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-[13px] font-black tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                  {group.date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </span>
                                {isToday && (
                                  <span className="bg-blue-500 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm">Hôm nay</span>
                                )}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${isDarkMode ? 'bg-blue-900/30 border-blue-800/50 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                {group.rentals.length} chuyến
                              </span>
                            </div>

                            <div className="px-0 z-20">
                              <LichTrinhChiTiet data={group.rentals} onRefresh={fetchData} isDarkMode={isDarkMode} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-center py-1 gap-3">
        
        <button 
          onClick={resetZoom}
          className={`w-11 h-11 border rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${scale > 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-gray-100 text-blue-600'}`}
        >
          <span className="font-black text-[14px] tracking-tighter">1X</span>
        </button>

        <button 
          onClick={() => { 
            const t = new Date(); 
            setSlideDirection(t > (viewMode === "day" ? selectedDate : currentWeekAnchor) ? 1 : -1);
            setCurrentWeekAnchor(t); 
            setSelectedDate(t); 
            resetZoom();
          }}
          className={`px-10 py-3 border text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-md active:scale-95 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-100 text-blue-600 hover:bg-gray-50'}`}
        >
          {viewMode === "day" ? "Hôm nay" : "Tuần này"}
        </button>

        <button 
          onClick={() => { fetchData(); resetZoom(); }} 
          disabled={loading}
          className={`w-11 h-11 border rounded-full shadow-md active:scale-90 transition-all flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </motion.div>

    </motion.div>
  );
}