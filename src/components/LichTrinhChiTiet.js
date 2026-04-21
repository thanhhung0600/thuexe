"use client";

export default function LichTrinhChiTiet({ data }) {
  const defaultColors = ["bg-blue-500", "bg-indigo-500", "bg-teal-500", "bg-amber-500"];

  const formatTime = (timeStr) => {
    if (!timeStr || String(timeStr).trim() === "" || String(timeStr).includes("1899")) return "_·_";
    if (String(timeStr).includes("T")) return String(timeStr).split("T")[1].substring(0, 5);
    return timeStr;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-80 py-10">
        <span className="text-3xl mb-2">🚗</span>
        <p className="text-[14px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">lịch trình trống</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px] p-[12px] animate-fade-in">
      {data.map((item, index) => (
        <div
          key={index}
          className={`w-full ${defaultColors[index % 4]} rounded-2xl flex flex-col justify-center 
                     min-h-[90px] p-3 relative transition-all active:scale-[0.98]
                     shadow-[inset_2px_2px_5px_rgba(255,255,255,0.3),inset_-2px_-2px_5px_rgba(0,0,0,0.2)]`}
        >
          {/* GIỜ: Đẩy lên cao hơn và nhỏ lại một chút */}
          <div className="absolute top-3 right-4 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20 text-white text-[12px] font-bold min-w-[45px] text-center">
            {formatTime(item.giờ || item.time)}
          </div>

          <div className="relative z-10 flex flex-col gap-0.5 text-white pr-14">
            {/* DÒNG 1: XE + TÀI XẾ (Giảm size chữ) */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase bg-white/25 px-1.5 py-0.5 rounded tracking-widest">
                {item.xe || item.label || "XE"}
              </span>
              <span className="text-[13px] font-bold opacity-90 truncate">
                • {item["Tài xế"] || item.tài_xế || "Chưa có tài"}
              </span>
            </div>

            {/* DÒNG 2: TÊN KHÁCH (Giảm size tiêu đề) */}
            <div className="flex items-baseline gap-2">
              <h3 className="text-[17px] font-black leading-tight truncate max-w-[140px]">
                {item["Tên khách"] || item.tên_khách || "Khách thuê"}
              </h3>
              <span className="text-[10px] font-bold opacity-70 whitespace-nowrap">
                {item["SĐT"] || item.sđt || ""}
              </span>
            </div>

            {/* DÒNG 3: GHI CHÚ (Thu nhỏ khoảng cách) */}
            <div className="flex items-center gap-1.5 mt-0.5">
               <div className="w-1 h-1 bg-white rounded-full opacity-50" />
               <p className="text-white/80 text-[9px] font-medium italic truncate">
                 {item["Ghi Chú"] || item.ghi_chú || "Không có ghi chú"}
               </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}