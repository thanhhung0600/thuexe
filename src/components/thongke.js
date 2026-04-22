"use client";

export default function ThongKe() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 animate-fade-in">
            <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-[16px] font-black uppercase tracking-wider text-slate-700">
                Biểu đồ phân tích
            </h3>
            <p className="text-[12px] mt-2 italic opacity-70">
                Tính năng đang được phát triển...
            </p>
        </div>
    );
}