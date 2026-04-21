export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dat-lich", label: "Đặt lịch" },
    { id: "xem-lich", label: "Lịch thuê" },
  ];

  return (
    <div className="flex w-full gap-2 px-8 relative z-10 -mb-[1px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 transition-all relative flex items-center justify-center text-[15px] font-bold uppercase tracking-[0.15em] antialiased 
          ${
            activeTab === tab.id
              ? "bg-white text-blue-600 border-t border-l border-r border-gray-200 border-b-transparent rounded-t-[2rem] z-20" 
              : "bg-gray-200 text-gray-500 border-none rounded-3xl mb-2 z-0 opacity-70"
          }`}
          style={{ outline: 'none' }} // Ngăn chặn viền xanh khi click trên mobile
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}