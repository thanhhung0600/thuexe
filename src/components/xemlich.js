"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function XemLich() {
  const [currentWeekAnchor, setCurrentWeekAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("day"); 
  const [slideDirection, setSlideDirection] = useState(0);

  const oRong = 38; 
  const oCao = 55; 
  const doDayLen = 0.5; 

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/get-lich?v=${Date.now()}`);
      const data = await response.json();
      if (Array.isArray(data)) setAllRentals(data);
      else setAllRentals([]);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu lịch trình:", error);
      setAllRentals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
      if (rentals.length > 0) grouped.push({ date: day, rentals });
    });
    return grouped;
  };

  const isSameDay = (d1, d2) => d1.toLocaleDateString() === d2.toLocaleDateString();
  const dotColors = ["bg-cyan-300", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

  // SWIPE LOGIC
  const minSwipeDistance = 50; 
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = (targetType) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isNext = distance > minSwipeDistance;
    const isPrev = distance < -minSwipeDistance;

    if (isNext || isPrev) {
      setSlideDirection(isNext ? 1 : -1);
      if (targetType === "week" || viewMode === "week") {
        const nextWeek = new Date(currentWeekAnchor);
        nextWeek.setDate(nextWeek.getDate() + (isNext ? 7 : -7));
        setCurrentWeekAnchor(nextWeek);
      } else {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + (isNext ? 1 : -1));
        setSelectedDate(nextDay);
        const start = daysInWeek[0].getTime();
        const end = daysInWeek[6].getTime();
        if (nextDay.getTime() < start || nextDay.getTime() > end) {
          setCurrentWeekAnchor(new Date(nextDay));
        }
      }
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col bg-white font-sans w-full max-w-md mx-auto relative h-auto">
      
      {/* 1. THANH CÔNG TẮC (Đã ép sát lề trên bằng mt-0) */}
      <motion.div variants={itemVariants} className="w-full flex items-center justify-center mt-0 mb-3">
        <div className="flex bg-gray-100 p-1 rounded-xl w-[180px] border border-gray-200 shadow-inner relative">
          <button onClick={() => setViewMode("day")} className={`flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "day" ? "text-blue-600" : "text-gray-400"}`}>Ngày</button>
          <button onClick={() => setViewMode("week")} className={`flex-1 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 relative z-10 ${viewMode === "week" ? "text-blue-600" : "text-gray-400"}`}>Tuần</button>
          <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ease-out z-0 ${viewMode === "day" ? "left-1" : "left-[calc(50%+2px)]"}`}></div>
        </div>
      </motion.div>

      {/* 2. THANH LỊCH NGANG */}
      <AnimatePresence>
        {viewMode === "day" && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mx-[-17px] bg-gray-50 rounded-2xl p-1.5 flex items-center justify-between border border-gray-100 shadow-sm relative z-20 overflow-hidden"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => onTouchEnd("week")}
          >
            <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() - 7)))} className="w-[26px] h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
            <div className="flex flex-1 justify-around items-center h-12 relative px-1">
              {daysInWeek.map((dateItem, idx) => {
                const active = isSameDay(dateItem, selectedDate);
                const count = getRentalsForDate(dateItem).length;
                return (
                  <div key={idx} className="flex-1 h-full relative flex items-center justify-center">
                    {active && <motion.div layoutId="active-bg" className="absolute bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-[16px] z-0" style={{ width: oRong, height: oCao, top: `calc(50% + ${doDayLen}px)`, y: "-50%" }} />}
                    <button onClick={() => setSelectedDate(dateItem)} className="relative z-10 flex flex-col items-center justify-center w-full h-full outline-none">
                      <span className={`text-[14px] font-[600] ${active ? "text-blue-600" : "text-gray-900"}`}>{dateItem.getDate()}</span>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${active ? "text-blue-500" : "text-gray-400"}`}>{["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateItem.getDay()]}</span>
                      <div className="mt-1 flex items-center justify-center h-[10px] w-full">
                        {count > 0 && (count > 4 ? <div className="h-[2.5px] w-[10px] rounded-full bg-blue-400" /> : <div className="grid grid-cols-2 gap-[2px]">{[...Array(4)].map((_, i) => (<div key={i} className={`w-[3px] h-[3px] rounded-full ${i < count ? dotColors[i] : "bg-transparent"} ${active ? 'opacity-100' : 'opacity-40'}`} />))}</div>)}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setCurrentWeekAnchor(new Date(currentWeekAnchor.setDate(currentWeekAnchor.getDate() + 7)))} className="w-[26px] h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. TIÊU ĐỀ THÔNG TIN */}
      <motion.div variants={itemVariants} className="w-full text-center pb-2">
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
          {viewMode === "day" 
            ? selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
            : `Tuần: ${daysInWeek[0].getDate()}/${daysInWeek[0].getMonth()+1} - ${daysInWeek[6].getDate()}/${daysInWeek[6].getMonth()+1}`
          }
        </h2>
      </motion.div>

      {/* 4. KHUNG NỘI DUNG (Tăng chiều cao tối đa) */}
      <motion.div 
        variants={itemVariants} 
        className={`mx-[-17px] ${viewMode === "week" ? "h-[500px]" : "h-[400px]"} overflow-y-auto bg-gray-50/50 rounded-2xl shadow-inner border border-gray-100 no-scrollbar relative mb-2 transition-all duration-300`}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => onTouchEnd("content")}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 animate-pulse"><span className="text-3xl">📅</span><div className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em]">Đang đồng bộ</div></div>
        ) : (
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={viewMode === "day" ? selectedDate.toISOString() : currentWeekAnchor.toISOString()}
              custom={slideDirection}
              variants={{
                enter: (d) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d) => ({ x: d < 0 ? 40 : -40, opacity: 0 })
              }}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: "easeOut" }}
              className="px-2 pt-1 pb-6"
            >
              {viewMode === "day" ? (
                <LichTrinhChiTiet data={getRentalsForDate(selectedDate)} />
              ) : (
                getGroupedRentalsForWeek().length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[350px] opacity-40"><span className="text-4xl mb-2">🌴</span><span className="text-[11px] font-black uppercase tracking-widest">Trống lịch tuần này</span></div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {getGroupedRentalsForWeek().map((group) => (
                      <div key={group.date.toISOString()} className="flex flex-col gap-2">
                        <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md border-y border-gray-200/50 py-1 px-3 mx-[-8px] flex items-center justify-between">
                          <span className="text-[12px] font-black text-slate-700">{group.date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}</span>
                          <span className="text-[9px] font-black text-blue-500 uppercase">{group.rentals.length} chuyến</span>
                        </div>
                        <LichTrinhChiTiet data={group.rentals} />
                      </div>
                    ))}
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* 5. FOOTER */}
      <motion.div variants={itemVariants} className="flex items-center justify-center py-1 gap-3">
        <button onClick={() => { const t = new Date(); setCurrentWeekAnchor(t); setSelectedDate(t); }} className="px-10 py-3 bg-white border border-gray-100 text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-md active:scale-95 transition-all">Hôm nay</button>
        <button onClick={fetchData} className="w-11 h-11 bg-white border border-gray-100 text-gray-500 rounded-full shadow-md flex items-center justify-center active:scale-90"><svg className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
      </motion.div>

      <style jsx>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
    </motion.div>
  );
}