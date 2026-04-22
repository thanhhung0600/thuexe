"use client";

export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dat-lich", label: "Đặt lịch" },
    { id: "xem-lich", label: "Xem lịch" },
    { 
      id: "thong-ke", 
      label: "", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    // 👇 THÊM TAB TÌM KIẾM Ở ĐÂY 👇
    { 
      id: "tim-kiem", 
      label: "", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ) 
    },
  ];

  return (
    <div className="flex w-full gap-2 px-8 relative z-10 -mb-[1px]">
      {tabs.map((tab) => {
        // Biến kiểm tra xem tab này là tab thường hay tab chỉ có icon
        const isIconTab = tab.label === "";

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 transition-all relative flex items-center justify-center text-[14px] font-bold uppercase tracking-[0.15em] antialiased 
            
            /* 👇 Nếu là icon tab thì hẹp lại, nếu là tab chữ thì nở ra 👇 */
            ${isIconTab ? "flex-[0.34] min-w-[40px]" : "flex-1"}
            
            /* 👇 LOGIC HIỂN THỊ TRẠNG THÁI 👇 */
            ${
              activeTab === tab.id
                ? isIconTab
                  // Active cho các nút icon (Bo 4 góc, lơ lửng)
                  ? "bg-white text-blue-600 border border-gray-200 rounded-[2rem] mb-2 z-20 shadow-sm" 
                  // Active cho các nút chữ (Bo 2 góc trên, dính liền khung)
                  : "bg-white text-blue-600 border-t border-l border-r border-white border-b-transparent rounded-t-[1.5rem] z-20" 
                // Không Active (Màu xanh, chìm xuống)
                : "bg-blue-600 text-white border-none rounded-3xl mb-2 z-0 opacity-70"
            }`}
            style={{ outline: 'none' }}
          >
            {tab.label}
            {tab.icon && tab.icon}
          </button>
        );
      })}
    </div>
  );
}