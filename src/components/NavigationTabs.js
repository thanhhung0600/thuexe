export default function NavigationTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dat-lich", label: "Đặt lịch thuê xe" },
    { id: "xem-lich", label: "Lịch thuê" },
  ];

  return (
    <div className="flex w-full gap-2 px-8 relative z-10 -mb-[1px]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 py-3 transition-all border relative flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.15em] antialiased ${
            activeTab === tab.id
              ? "bg-white text-blue-600 border-gray-200 border-b-white rounded-t-3xl z-20"
              : "bg-gray-200 text-gray-500 border-transparent rounded-3xl mb-2 z-0 opacity-70"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}