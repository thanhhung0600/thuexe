"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function LichTrinhChiTiet({ data }) {
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const defaultColors = ["bg-blue-400", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

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
        <div className="flex flex-col gap-[10px] p-[12px] relative">
            
            {/* DANH SÁCH CÁC CARD LỊCH TRÌNH */}
            {data.map((item, index) => (
                <div
                    key={index}
                    // KHÔI PHỤC HIỆU ỨNG KHỐI LỒI & ANIMATION:
                    // 1. shadow-[inset...] tạo độ lồi 3D (sáng góc trên, tối góc dưới) + shadow-md tạo bóng đổ
                    // 2. animate-slide-up kết hợp style delay để trượt lên tuần tự
                    className={`w-full ${defaultColors[index % 4]} rounded-2xl flex flex-col justify-center min-h-[95px] p-3 relative 
                                transition-all duration-150 active:scale-[0.97] cursor-pointer
                                shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_4px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.1)]
                                opacity-0 animate-slide-up`}
                    style={{ 
                        animationDelay: `${index * 0.08}s`, // Các thẻ xuất hiện lệch nhau 0.08s
                        animationFillMode: 'forwards' 
                    }}
                >
                    {/* GÓC PHẢI: GIỜ, GIÁ & NÚT OPTION */}
                    <div className="absolute top-3 right-3 bottom-3 flex flex-col items-end justify-between z-20">
                        <div className="flex items-center gap-2">
                            {item["Giá"] && (
                                <div className="bg-white/40 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 shadow-sm border border-white/20">
                                    {item["Giá"]}
                                </div>
                            )}
                            <div className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-black/5 text-white text-[12px] font-bold min-w-[45px] text-center">
                                {formatTime(item.giờ || item.time)}
                            </div>
                        </div>

                        {/* NÚT OPTION */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMenuIndex(index);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 active:scale-75 active:bg-white transition-all border border-white/40 shadow-sm"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                        </button>
                    </div>

                    {/* NỘI DUNG BÊN TRÁI CARD */}
                    <div className="relative z-10 flex flex-col gap-0.5 text-white pr-14">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase bg-white/25 px-1.5 py-0.5 rounded tracking-widest">
                                {item.xe || item.label || "______"}
                            </span>
                            <span className="text-[13px] font-bold opacity-90 truncate">
                                • {item["Tài xế"] || item.tài_xế || "Chưa có tài"}
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-[17px] font-black leading-tight truncate max-w-[140px]">
                                {item["Tên khách"] || item.tên_khách || "Khách thuê"}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1 h-1 bg-white rounded-full opacity-50" />
                            <p className="text-white text-[9px] font-medium italic truncate">
                                {item["Ghi Chú"] || item.ghi_chú || "Không có ghi chú"}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {/* KHUNG THÔNG BÁO (MODAL) VỚI LỚP PHỦ XUYÊN THỦNG */}
            {typeof selectedMenuIndex === 'number' && isClient && createPortal(
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-6 animate-scale-in"
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.4)', 
                        backdropFilter: 'blur(8px)',       
                        WebkitBackdropFilter: 'blur(8px)'  
                    }}
                    onClick={() => setSelectedMenuIndex(null)}
                >
                    <div 
                        className="bg-white rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-center font-black text-slate-800 text-[18px] mb-6">
                            Thay đổi thông tin thuê xe
                        </h3>

                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    className="bg-blue-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-md text-sm"
                                    onClick={() => { alert("Sửa"); setSelectedMenuIndex(null); }}
                                >
                                    Sửa
                                </button>
                                <button 
                                    className="bg-red-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-md text-sm"
                                    onClick={() => { alert("Xóa"); setSelectedMenuIndex(null); }}
                                >
                                    Xóa
                                </button>
                            </div>
                            <button 
                                className="bg-slate-100 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all mt-1 text-sm"
                                onClick={() => setSelectedMenuIndex(null)}
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Thêm CSS cho hiệu ứng trượt lên (Slide Up) */}
            <style jsx>{`
                @keyframes slideUp {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}