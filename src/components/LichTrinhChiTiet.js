"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LichTrinhChiTiet({ data, showDate = false, onRefresh }) {
    // Quản lý bảng Tùy chọn (Menu 3 chấm)
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
    // Quản lý bảng Xác nhận xóa (Sau khi bấm Xóa ở menu)
    const [confirmingIndex, setConfirmingIndex] = useState(null);
    
    const [isClient, setIsClient] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { 
        setIsClient(true); 
    }, []);

    const defaultColors = ["bg-blue-400", "bg-indigo-400", "bg-teal-400", "bg-emerald-400"];

    const formatTime = (t) => (!t || String(t).trim()==="" || String(t).includes("1899")) ? "_·_" : (String(t).includes("T") ? String(t).split("T")[1].substring(0, 5) : t);
    const formatDateShort = (d) => { if(!d) return ""; const p = d.includes('/') ? d.split('/') : d.split('-'); return d.includes('/') ? `${p[0]}/${p[1]}` : `${p[2]}/${p[1]}`; };

    const checkIsLocked = (item) => {
        if (!item) return false;
        const dateVal = item.ngày || item.date;
        if (!dateVal) return false;
        const fDate = dateVal.includes('/') ? dateVal.split('/').reverse().join('-') : dateVal;
        const tripD = new Date(fDate);
        const today = new Date();
        today.setHours(0,0,0,0); tripD.setHours(0,0,0,0);
        return (Math.ceil((today - tripD) / (1000*60*60*24))) > 2;
    };

    const handleDelete = async (rowId) => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/xoa-lich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: rowId }),
            });
            const result = await res.json();
            if (result.success) {
                setConfirmingIndex(null); // 1. Đóng bảng xác nhận xóa
                
                // 2. GỬI LỆNH REFRESH VỀ XEMLICH.JS ĐỂ RELOAD DỮ LIỆU
                if (typeof onRefresh === 'function') {
                    onRefresh(); 
                }
            } else {
                alert("Lỗi: " + result.error);
            }
        } catch (error) { 
            console.error("Lỗi xóa:", error); 
        } finally { 
            setIsDeleting(false); 
        }
    };

    if (!data || data.length === 0) return (
        <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <span className="text-3xl mb-2">🚗</span>
            <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest">Lịch trình trống</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-2.5 p-1 relative">
            {/* RENDER DANH SÁCH THẺ */}
            {data.map((item, index) => (
                <div key={item.rowId || index} className={`${defaultColors[index % 4]} rounded-xl p-3 relative shadow-md overflow-hidden min-h-[95px] flex flex-col justify-center`}>
                    <div className="w-full">
                        <div className="absolute top-3 right-3 bottom-3 flex flex-col items-end justify-between z-20">
                            <div className="flex items-center gap-2">
                                {item.gia && <div className="bg-white/30 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800">{item.gia}</div>}
                                <div className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded border border-black/5 text-white text-[12px] font-bold">
                                    {showDate && <span className="text-[9px] block opacity-70">{formatDateShort(item.ngày || item.date)}</span>}
                                    {formatTime(item.time || item.gio)}
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedMenuIndex(index); }} 
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/40 active:scale-75 transition-all"
                            >
                                <svg className="w-4 h-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-white pr-10">
                            <div className="flex items-center gap-1">
                                <span className="text-[9px] font-black bg-white/20 px-1 rounded">{item.loaiXe || item.label}</span>
                                <span className="text-[13px] font-bold opacity-90">• {item.taiXe || "Chưa có tài"}</span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                <h3 className="text-[14px] font-bold">{item.tenKhachHang || item.tenKhach}</h3>
                                <span className="text-[11px] opacity-80">• {item.soDienThoai || item.sdt}</span>
                            </div>
                            <p className="text-[13px] font-medium opacity-95 mt-1 truncate">{item.ghiChu || "Không có ghi chú"}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* BẢNG 1: TÙY CHỌN SỬA / XÓA */}
            {typeof selectedMenuIndex === 'number' && isClient && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-6 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedMenuIndex(null)}>
                    <div className="bg-white rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-center font-black text-slate-800 text-[18px] mb-6">Tùy chọn chuyến xe</h3>
                        {checkIsLocked(data[selectedMenuIndex]) ? (
                            <div className="text-center">
                                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 font-bold text-sm mb-4">🔒 Chuyến đi cũ (Khóa)</div>
                                <button className="w-full bg-slate-100 py-4 rounded-2xl font-black" onClick={() => setSelectedMenuIndex(null)}>Đóng</button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button className="bg-blue-500 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all">Sửa thông tin</button>
                                <button 
                                    onClick={() => {
                                        setConfirmingIndex(selectedMenuIndex);
                                        setSelectedMenuIndex(null); 
                                    }} 
                                    className="bg-red-500 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all"
                                >
                                    Xóa chuyến
                                </button>
                                <button className="bg-slate-100 py-4 rounded-2xl font-black active:scale-95 transition-all" onClick={() => setSelectedMenuIndex(null)}>Hủy bỏ</button>
                            </div>
                        )}
                    </div>
                </div>, document.body
            )}

            {/* BẢNG 2: XÁC NHẬN XÓA */}
            {typeof confirmingIndex === 'number' && isClient && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmingIndex(null)}>
                    <div className="bg-white rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Icon cảnh báo */}
                        <div className="flex justify-center mb-4 text-red-500">
                            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        
                        <h3 className="text-center font-black text-slate-800 text-[18px] mb-2">Xác nhận xóa?</h3>
                        <p className="text-center text-slate-600 text-sm mb-6 leading-relaxed">
                            Bạn có chắc chắn muốn xóa chuyến của <span className="font-bold text-slate-800">{data[confirmingIndex]?.tenKhachHang || data[confirmingIndex]?.tenKhach}</span> không? Hành động này không thể hoàn tác.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => handleDelete(data[confirmingIndex].rowId)}
                                disabled={isDeleting}
                                className="w-full bg-red-500 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? "Đang xử lý..." : "Đúng, xác nhận xóa"}
                            </button>
                            <button 
                                onClick={() => setConfirmingIndex(null)}
                                disabled={isDeleting}
                                className="w-full bg-slate-100 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
}