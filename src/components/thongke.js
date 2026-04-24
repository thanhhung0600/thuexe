"use client";
import { useState, useEffect, useCallback } from "react";

export default function ThongKe() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  
  const [showHeights, setShowHeights] = useState(false);
  const [showLine, setShowLine] = useState(false);

  const totalActivities = chartData.reduce((sum, item) => sum + item.count, 0);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
      setShowHeights(false);
    }
    
    setShowLine(false); 
    
    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await fetch(`/api/thong-ke?month=${m}&year=${y}&t=${Date.now()}`);
      const result = await res.json();

      if (result.success) {
        setChartData(result.data);
        setHistoryData(result.history);
        
        setTimeout(() => {
          setShowHeights(true);
          setShowLine(true); 
        }, 100);
      }
    } catch (err) {
      console.error("UI Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData(false);
    return () => {
      setShowHeights(false);
      setShowLine(false);
    };
  }, []);

  useEffect(() => {
    loadData(true);
  }, [currentDate, loadData]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // ==========================================
  // RENDER BIỂU ĐỒ 1: THÁNG HIỆN TẠI
  // ==========================================
  const renderChart1 = () => {
    const maxVal = Math.max(...chartData.map(d => d.count), 1);

    return (
      <div className="relative w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Tổng: <span className="text-blue-600 ml-1">{totalActivities} Chuyến</span>
          </span>
          
          <div className="w-[70px] h-[20px] bg-slate-50 border border-gray-200 rounded-full flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-400 animate-pulse tracking-tight">Realtime</span>
          </div>
        </div>

        {/* Đã giảm chiều cao từ h-[160px] xuống h-[110px] và mt-8 xuống mt-6 */}
        <div className="h-[110px] mt-6 flex items-end justify-around gap-2 relative z-10 border-b border-gray-200 pb-1">
          {chartData.map((col) => {
            const heightPct = Math.max((col.count / maxVal) * 85, 4);

            return (
              <div key={col.id} className="flex flex-col items-center justify-end h-full w-full relative z-10">
                <span className="text-[11px] font-black text-slate-700 mb-0.5 transition-all duration-700">{col.count}</span>
                <div
                  className={`w-[80%] max-w-[32px] rounded-t-xl ${col.color} shadow-sm transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)`}
                  style={{ height: showHeights ? `${heightPct}%` : "0%" }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start justify-around gap-2 mt-1.5">
          {chartData.map((col) => (
            <div key={`label-${col.id}`} className="w-full text-center">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 leading-tight block">{col.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER BIỂU ĐỒ 2: XU HƯỚNG
  // ==========================================
  const renderChart2 = () => {
    const maxVal = Math.max(...historyData.map(d => d.count), 1);
    const getHPct = (count) => Math.max((count / maxVal) * 75, 4);
    
    const points = historyData.map((col, i) => {
      const x = ((i + 0.5) / historyData.length) * 100;
      const y = 100 - getHPct(col.count);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full bg-slate-50 border border-gray-200 rounded-2xl p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Xu hướng 4 tháng: <span className="text-blue-600 ml-1">Tổng H.Động</span>
          </span>
        </div>

        {/* Đã giảm chiều cao từ h-[90px] xuống h-[70px] và mt-8 xuống mt-6 */}
        <div className="h-[70px] mt-6 flex items-end justify-around gap-2 relative z-10 border-b border-gray-200 pb-1">
          
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="absolute top-0 left-0 w-full h-[calc(100%-0.25rem)] z-0 pointer-events-none" 
            style={{ 
              opacity: showLine ? 1 : 0,
              clipPath: showLine ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
              transition: showLine ? "clip-path 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s, opacity 0.3s" : "none" 
            }}
          >
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {historyData.map((col) => {
            const heightPct = getHPct(col.count);

            return (
              <div key={col.id} className="flex flex-col items-center justify-end h-full w-full relative z-10">
                <span className="text-[10px] font-black text-slate-700 mb-0 transition-all duration-700">{col.count}</span>
                
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full border border-white shadow-sm z-20 mb-[-2.5px] transition-all duration-1000 delay-100"
                  style={{ transform: showHeights ? "scale(1)" : "scale(0)" }}
                ></div>
                
                <div
                  className={`w-[45%] max-w-[16px] rounded-t-xl ${col.color} shadow-sm transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-10`}
                  style={{ height: showHeights ? `${heightPct}%` : "0%" }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start justify-around gap-2 mt-1.5">
          {historyData.map((col) => (
            <div key={`label-${col.id}`} className="w-full text-center">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 leading-tight block">{col.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    // Giảm gap-5 xuống gap-3
    <div className="flex flex-col gap-3 animate-fade-in w-full text-slate-800 pb-2">

      {/* KHUNG ĐIỀU CHỈNH THÁNG */}
      <div className="flex items-center justify-between gap-2.5">
        <button onClick={() => changeMonth(-1)} className="w-9 h-9 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div onClick={() => setCurrentDate(new Date())} className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl h-9 flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none">
          <span className="text-[13px] font-black uppercase tracking-widest text-blue-600">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </span>
        </div>

        <button onClick={() => changeMonth(1)} className="w-9 h-9 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* MÀN HÌNH LOADING LỚP PHỦ */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
          <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em]">Đang đồng bộ</span>
        </div>
      )}

      {renderChart1()}
      {renderChart2()}

      {/* Nút Làm Mới giảm py-4 thành py-2.5 */}
      <button
        onClick={() => loadData(false)}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-600 font-black uppercase text-[11px] tracking-widest py-2.5 rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-50"
      >
        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Làm mới dữ liệu
      </button>

    </div>
  );
}