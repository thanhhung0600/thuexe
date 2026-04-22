"use client";
import { useState, useEffect, useCallback } from "react";

export default function ThongKe() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  
  // ✅ THÊM BIẾN NÀY: Dùng để kích hoạt hiệu ứng mọc lên
  const [showHeights, setShowHeights] = useState(false);

  const totalActivities = chartData.reduce((sum, item) => sum + item.count, 0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setShowHeights(false); // Reset chiều cao về 0% mỗi khi bắt đầu tải

    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await fetch(`/api/thong-ke?month=${m}&year=${y}&t=${Date.now()}`);
      const result = await res.json();
      
      if (result.success) {
        setChartData(result.data);
        
        // ✅ BÍ QUYẾT Ở ĐÂY: Đợi React vẽ các cột ở mức 0% xong, 
        // delay 50ms rồi mới bung chiều cao thật ra để lấy hiệu ứng
        setTimeout(() => {
          setShowHeights(true);
        }, 50);
      }
    } catch (err) {
      console.error("UI Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in w-full text-slate-800">
      
      {/* KHUNG ĐIỀU CHỈNH THÁNG */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => changeMonth(-1)} className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div onClick={() => setCurrentDate(new Date())} className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl h-10 flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none">
          <span className="text-[14px] font-black uppercase tracking-widest text-blue-600">
            Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
          </span>
        </div>

        <button onClick={() => changeMonth(1)} className="w-10 h-10 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-all flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* KHUNG BIỂU ĐỒ */}
      <div className="relative w-full bg-slate-50 border border-gray-200 rounded-[2rem] p-4 pt-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[300px]">
        
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-[2rem]">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">Đang tính toán...</span>
          </div>
        )}

        <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-10">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Tổng hoạt động: <span className="text-blue-600 ml-1">{totalActivities}</span>
          </span>
          <span className="text-[10px] font-medium text-green-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Đồng bộ Realtime
          </span>
        </div>

        <div className="h-[200px] mt-8 flex items-end justify-around gap-2 relative z-10 border-b border-gray-200 pb-2">
          {chartData.map((col) => (
            <div key={col.id} className="flex flex-col items-center justify-end h-full w-full">
              <span className="text-[14px] font-black text-slate-700 mb-1">{col.count}</span>
              <div 
                className={`w-[80%] max-w-[40px] rounded-t-xl ${col.color} shadow-sm transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)`}
                /* ✅ ĐỔI SANG DÙNG BIẾN showHeights Ở ĐÂY */
                style={{ height: showHeights ? col.height : "0%" }}
              ></div>
            </div>
          ))}
        </div>

        <div className="flex items-start justify-around gap-2 mt-2">
          {chartData.map((col) => (
            <div key={`label-${col.id}`} className="w-full text-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 leading-tight block">{col.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NÚT RELOAD */}
      <button 
        onClick={loadData}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-600 font-black uppercase text-[12px] tracking-widest py-4 rounded-2xl shadow-sm active:scale-95 transition-all disabled:opacity-50"
      >
        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isLoading ? "Vui lòng đợi..." : "Cập nhật dữ liệu"}
      </button>

    </div>
  );
}