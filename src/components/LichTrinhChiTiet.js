"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// THÊM biến showDate = false vào props
export default function LichTrinhChiTiet({ data, showDate = false }) {
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

    // THÊM: Hàm định dạng ngày ngắn gọn (VD: 20/04)
    const formatDateShort = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.includes('/') ? dateStr.split('/') : dateStr.split('-');
        if (parts.length < 2) return "";
        return dateStr.includes('/') ? `${parts[0]}/${parts[1]}` : `${parts[2]}/${parts[1]}`;
    };

    // HÀM KIỂM TRA CHUYẾN ĐI CÓ QUÁ 3 NGÀY KHÔNG
    const checkIsLocked = (item) => {
        if (!item) return false;
        const dateVal = item.ngày || item.date;
        if (!dateVal) return false;

        // Xử lý định dạng ngày (hỗ trợ cả DD/MM/YYYY và YYYY-MM-DD)
        const formattedDateVal = dateVal.includes('/') ? dateVal.split('/').reverse().join('-') : dateVal;
        const tripDate = new Date(formattedDateVal);
        
        if (isNaN(tripDate.getTime())) return false;

        const today = new Date();
        // Reset thời gian về 0h00 để chỉ so sánh ngày
        today.setHours(0, 0, 0, 0);
        tripDate.setHours(0, 0, 0, 0);

        // Tính khoảng cách giữa 2 ngày
        const diffTime = today - tripDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Nếu khoảng cách lớn hơn 3 ngày thì KHÓA
        return diffDays > 2;
    };

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full opacity-80 py-10 animate-pop-in">
                <span className="text-3xl mb-2">🚗</span>
                <p className="text-[14px] font-black text-blue-600 uppercase tracking-[0.2em]">lịch trình trống</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-[10px] p-[6px] relative">
            
            {data.map((item, index) => (
                <div
                    key={index}
                    className={`w-[100.5%] ml-[-0.25%] ${defaultColors[index % 4]} rounded-[13px] flex flex-col justify-center min-h-[95px] p-3 relative 
                                transition-all duration-150 active:scale-[0.95] cursor-pointer
                                shadow-[inset_1px_1px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_4px_rgba(0,0,0,0.15),0_4px_8px_rgba(0,0,0,0.1)]
                                opacity-0 animate-pop-in`}
                    style={{ 
                        animationDelay: `${index * 0.1}s`, 
                        animationFillMode: 'forwards' 
                    }}
                >
                    {/* GÓC PHẢI: GIỜ, GIÁ & NÚT OPTION */}
                    <div className="absolute top-3 right-3 bottom-3 flex flex-col items-end justify-between z-20">
                        <div className="flex items-center gap-2">
                            {item.gia && (
                                <div className="bg-white/40 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 shadow-sm border border-white/20">
                                    {item.gia}
                                </div>
                            )}
                            {/* CẬP NHẬT LẠI Ô HIỂN THỊ GIỜ VÀ NGÀY */}
                            <div className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded-md border border-black/5 text-white text-[12px] font-bold min-w-[45px] text-center flex flex-col items-center justify-center leading-tight">
                                {showDate && item.ngày && (
                                    <span className="text-[9px] opacity-80 mb-[-2px] tracking-wider">{formatDateShort(item.ngày)}</span>
                                )}
                                <span>{formatTime(item.time)}</span>
                            </div>
                        </div>

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
                    <div className="relative z-10 flex flex-col gap-0.5 text-white pr-0 -mt-0.5">
                        <div className="flex items-center gap-0.25 pr-25">
                            <span className="text-[9px] font-black uppercase bg-white/25 px-0.5 py-0.5 rounded tracking-widest">
                                {item.label || "______"}
                            </span>
                            <span className="text-[13px] font-bold opacity-90 truncate">• {item.taiXe || "Chưa có tài"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                            <h3 className="text-[15px] font-bold leading-tight truncate">
                                {item.tenKhach || "Khách thuê"}
                            </h3>
                            {item.sdt && (
                                <span className="text-[12px] font-bold opacity-80 mt-0.5">
                                    • {item.sdt}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1 h-1 bg-white rounded-full opacity-50" />
                            <p className="text-white text-[9px] font-medium italic truncate">
                                {item.ghiChu || "Không có ghi chú"}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {/* MODAL PORTAL TÙY CHỈNH THEO TRẠNG THÁI KHÓA */}
            {typeof selectedMenuIndex === 'number' && isClient && createPortal(
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-6"
                    style={{ 
                        backgroundColor: 'rgba(0,0,0,0.4)', 
                        backdropFilter: 'blur(8px)',       
                        WebkitBackdropFilter: 'blur(8px)'  
                    }}
                    onClick={() => setSelectedMenuIndex(null)}
                >
                    <div 
                        className="bg-white rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl animate-pop-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-center font-black text-slate-800 text-[18px] mb-6">
                            Thay đổi thông tin thuê xe
                        </h3>

                        {/* GỌI HÀM KIỂM TRA Ở ĐÂY ĐỂ HIỂN THỊ GIAO DIỆN PHÙ HỢP */}
                        {checkIsLocked(data[selectedMenuIndex]) ? (
                            
                            /* ==================================
                                GIAO DIỆN BỊ KHÓA (> 3 ngày) 
                               ================================== */
                            <div className="flex flex-col gap-3">
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center gap-2 mb-1">
                                    <span className="text-[28px]">🔒</span>
                                    <p className="text-[13px] font-bold text-red-600 leading-snug">
                                        Bạn không thể chỉnh sửa<br/>chuyến đi đã qua 3 ngày
                                    </p>
                                </div>
                                <button 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm"
                                    onClick={() => setSelectedMenuIndex(null)}
                                >
                                    Đã hiểu / Hủy bỏ
                                </button>
                            </div>

                        ) : (
                            
                            /* ==================================
                                GIAO DIỆN BÌNH THƯỜNG (Có thể Sửa/Xóa) 
                               ================================== */
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-blue-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-md text-sm">Sửa</button>
                                    <button className="bg-red-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-md text-sm">Xóa</button>
                                </div>
                                <button 
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all mt-1 text-sm"
                                    onClick={() => setSelectedMenuIndex(null)}
                                >
                                    Hủy bỏ
                                </button>
                            </div>
                            
                        )}
                    </div>
                </div>,
                document.body
            )}

            <style jsx>{`
                @keyframes popIn {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.8) translateY(30px); 
                    }
                    70% { 
                        transform: scale(1) translateY(0px); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }
                .animate-pop-in {
                    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>
        </div>
    );
}