"use client";

export default function TimKiem() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 animate-fade-in">
            {/* Icon kính lúp lớn */}
            <svg className="w-16 h-16 mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-[16px] font-black uppercase tracking-wider text-slate-700">
                Tìm kiếm lịch trình
            </h3>
            <p className="text-[12px] mt-2 italic opacity-70">
                Tính năng đang được phát triển...
            </p>
        </div>
    );
}