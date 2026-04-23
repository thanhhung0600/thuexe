"use client";
import { useState, useEffect, useCallback } from "react";

export default function ThongKe() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [showHeights, setShowHeights] = useState(false);

  const totalActivities = chartData.reduce((sum, item) => sum + item.count, 0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setShowHeights(false);
    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await fetch(`/api/thong-ke?month=${m}&year=${y}&t=${Date.now()}`);
      const result = await res.json();

      if (result.success) {
        setChartData(result.data);
        setHistoryData(result.history);
        setTimeout(() => setShowHeights(true), 50);
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

  // ==========================================
  // RENDER BIỂU ĐỒ 1 (Cột to, Scale full chiều cao, Không chấm tròn)
  // ==========================================
  const renderChart1 = () => {
    // Tìm giá trị lớn nhất trong tháng để scale. Nếu tất cả bằng 0 thì mặc định max là 1
    const maxVal = Math.max(...chartData.map(d => d.count), 1);

    return (
      <div className="relative w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 pt-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[280px]">
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Tổng hoạt động: <span className="text-blue-600 ml-1">{totalActivities} Chuyến</span>
          </span>
          <div className="w-[110px] h-[30px] bg-slate-50 border border-gray-200 rounded-full flex items-center justify-center gap-1">
            {/* Dấu chấm tròn dùng div để tròn tuyệt đối và dễ căn chỉnh */}
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>

            <span className="text-[12px] font-bold text-green-400 animate-pulse tracking-tight">
              Realtime
            </span>
          </div>
        </div>

        <div className="h-[160px] mt-8 flex items-end justify-around gap-2 relative z-10 border-b border-gray-200 pb-2">
          {chartData.map((col) => {
            // Scale cột: Giá trị cao nhất sẽ chiếm 85% khung, giá trị 0 sẽ chiếm 4% (để nhú lên 1 xíu)
            const heightPct = Math.max((col.count / maxVal) * 85, 4);

            return (
              <div key={col.id} className="flex flex-col items-center justify-end h-full w-full relative z-10">
                <span className="text-[12px] font-black text-slate-700 mb-1">{col.count}</span>
                <div
                  className={`w-[80%] max-w-[35px] rounded-t-xl ${col.color} shadow-sm transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)`}
                  style={{ height: showHeights ? `${heightPct}%` : "0%" }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start justify-around gap-2 mt-2">
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
  // RENDER BIỂU ĐỒ 2 (Cột nhỏ 60%, Có chấm tròn, Có line đứt nối đỉnh)
  // ==========================================
  const renderChart2 = () => {
    const maxVal = Math.max(...historyData.map(d => d.count), 1);

    // Hàm tính chiều cao % chung cho cả SVG và Div (Max 75% để chừa chỗ cho chấm tròn và số)
    const getHPct = (count) => Math.max((count / maxVal) * 75, 4);

    // Tính toán tọa độ cho đường nối SVG nét đứt
    const points = historyData.map((col, i) => {
      const x = ((i + 0.5) / historyData.length) * 100; // Tọa độ X ngay tâm cột
      const y = 100 - getHPct(col.count);               // Tọa độ Y ngay đỉnh cột
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative w-full bg-slate-50 border border-gray-200 rounded-2xl p-4 pt-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[190px]">
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Xu hướng 4 tháng: <span className="text-blue-600 ml-1">Tổng hoạt động</span>
          </span>
        </div>

        <div className="h-[90px] mt-8 flex items-end justify-around gap-2 relative z-10 border-b border-gray-200 pb-2">

          {/* ĐƯỜNG LINE NỐI ĐỈNH (SVG) */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-[calc(100%-0.5rem)] z-0 pointer-events-none transition-opacity duration-1000 delay-300" style={{ opacity: showHeights ? 1 : 0 }}>
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* CỘT, CHẤM TRÒN VÀ SỐ */}
          {historyData.map((col) => {
            const heightPct = getHPct(col.count);

            return (
              <div key={col.id} className="flex flex-col items-center justify-end h-full w-full relative z-10">
                {/* 1. Số đếm trên cùng */}
                <span className="text-[11px] font-black text-slate-700 mb-0.5">{col.count}</span>

                {/* 2. Chấm tròn nằm dưới số (Dùng HTML Div để tròn xoe không bị méo) */}
                <div
                  className="w-2.5 h-2.5 bg-blue-500 rounded-full border border-white shadow-sm z-20 mb-[-3px] transition-all duration-1000 delay-100"
                  style={{ transform: showHeights ? "scale(1)" : "scale(0)" }}
                ></div>

                {/* 3. Cột biểu đồ (Rộng 45% ~ Khoảng 60% so với biểu đồ 1) */}
                <div
                  className={`w-[45%] max-w-[18px] rounded-t-xl ${col.color} shadow-sm transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-10`}
                  style={{ height: showHeights ? `${heightPct}%` : "0%" }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="flex items-start justify-around gap-2 mt-2">
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
    <div className="flex flex-col gap-5 animate-fade-in w-full text-slate-800 pb-4">

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

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
          <span className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em]">Đang đồng bộ</span>
        </div>
      )}

      {/* Gọi hàm vẽ 2 biểu đồ */}
      {renderChart1()}
      {renderChart2()}

      {/* NÚT RELOAD */}
      <button
        onClick={loadData}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-600 font-black uppercase text-[12px] tracking-widest py-4 rounded-2xl shadow-sm active:scale-95 transition-all disabled:opacity-50 mt-1"
      >
        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Làm mới dữ liệu
      </button>

    </div>
  );
}