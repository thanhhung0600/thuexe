"use client";
import { useState } from "react";
import LichTrinhChiTiet from "./LichTrinhChiTiet";

export default function TimKiem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("xe"); // Thứ tự 1: Tên xe
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setResults(null);

    try {
      const res = await fetch(`/api/tim-kiem?type=${searchType}&q=${encodeURIComponent(searchTerm)}&t=${Date.now()}`);
      const data = await res.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Lỗi hệ thống khi tìm kiếm:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in w-full text-slate-800 pb-2">
      
      {/* 1. KHUNG TÌM KIẾM */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        
        {/* Bộ lọc loại tìm kiếm (Chips) */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-gray-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
          {[
            { id: "xe", label: "Tên Xe" },
            { id: "taixe", label: "Tài xế" },
            { id: "diadiem", label: "Địa điểm" }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSearchType(type.id);
                setResults(null);
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                searchType === type.id 
                  ? "bg-white text-blue-600 shadow-sm border border-gray-100 scale-[1.02]" 
                  : "text-gray-400 active:bg-gray-100 opacity-70"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Ô NHẬP LIỆU VÀ NÚT TÌM KIẾM (NẰM NGANG) */}
        <div className="flex items-center gap-2 w-full">
          
          {/* Ô nhập liệu */}
          <div className="relative group flex-1">
            <input
              type="text"
              placeholder={
                searchType === "xe" ? "Nhập tên xe..." :
                searchType === "taixe" ? "Nhập tên tài xế..." :
                "Tìm địa điểm..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[45px] bg-slate-50 border border-gray-200 rounded-2xl pl-11 pr-9 outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] text-slate-800 font-medium transition-all placeholder:text-gray-400 placeholder:font-normal text-[14px]"
            />
            
            {/* Icon kính lúp bên trong ô nhập */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Nút xóa nhanh nội dung */}
            {searchTerm && (
              <button 
                type="button"
                onClick={() => { setSearchTerm(""); setResults(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 active:scale-90 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* NÚT THỰC HIỆN TÌM KIẾM (Ô VUÔNG CHỨA ICON) */}
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            // Thay px-6 thành w-[56px] để tạo thành ô vuông hoàn hảo với h-[56px]
            className={`w-[45px] h-[45px] rounded-full shadow-sm transition-all flex items-center justify-center shrink-0
              ${isLoading || !searchTerm.trim() 
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' 
                : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95 shadow-md border border-blue-500'
              }`}
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              // Icon Gửi / Tìm kiếm (Tạo cảm giác như nút 'Go' trên bàn phím)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* 2. KHU VỰC KẾT QUẢ TÌM KIẾM */}
      <div className="mt-[-5] h-[380px] overflow-y-auto no-scrollbar relative border border-gray-300 bg-slate-50 rounded-2xl bg-gray-50/30 p-1">
        
        {/* Trường hợp chưa nhập dữ liệu */}
        {results === null && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full opacity-40">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center leading-loose">
              Chọn tiêu chí và nhập từ khóa<br/>để bắt đầu tra cứu dữ liệu
            </p>
          </div>
        )}

        {/* Trường hợp không tìm thấy kết quả nào */}
        {results !== null && results.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full animate-pop-in">
            <div className="text-5xl mb-4">🙊</div>
            <p className="text-[12px] font-black text-red-400 uppercase tracking-widest text-center">
              Rất tiếc, không tìm thấy<br/>chuyến đi nào phù hợp
            </p>
          </div>
        )}

        {/* Trường hợp có kết quả */}
        {results !== null && results.length > 0 && !isLoading && (
          <div className="animate-fade-in px-1">
            <div className="mb-1 flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Đã tìm thấy: <span className="text-blue-600 ml-1">{results.length} kết quả</span>
              </span>
            </div>
            
            <LichTrinhChiTiet data={results} showDate={true} />
            
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}