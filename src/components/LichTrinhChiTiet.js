"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// update ver 14 - clean build

export default function LichTrinhChiTiet({ data, showDate = false, onRefresh }) {
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
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

    // --- HÀM XÓA SỬ DỤNG WINDOW.CONFIRM TẠM THỜI ---
    const handleDelete = async () => {
        const item = data[selectedMenuIndex];
        if (!item?.rowId) return;

        const isConfirmed = window.confirm(`Bạn chắc chắn muốn xóa chuyến của ${item.tenKhachHang || item.tenKhach}?`);
        if (!isConfirmed) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch('/api/xoa-lich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.rowId }),
            });
            
            const result = await res.json();
            
            if (result.success) {
                setSelectedMenuIndex(null);
                if (onRefresh) await onRefresh();
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
            {data.map((item, index) => (
                <div key={index} className={`${defaultColors[index % 4]} rounded-xl p-3 relative shadow-md`}>
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
                    <div className="text-white">
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] font-black bg-white/20 px-1 rounded">{item.loaiXe || item.label}</span>
                            <span className="text-[13px] font-bold opacity-90">• {item.taiXe || "Chưa có tài"}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            {/* Đã giảm size Tên khách và SĐT */}
                            <h3 className="text-[14px] font-bold">{item.tenKhachHang || item.tenKhach}</h3>
                            <span className="text-[11px] opacity-80">• {item.soDienThoai || item.sdt}</span>
                        </div>
                        {/* Đã tăng size Ghi chú, làm rõ nét hơn */}
                        <p className="text-[13px] font-medium opacity-95 mt-1 truncate">{item.ghiChu || "Không có ghi chú"}</p>
                    </div>
                </div>
            ))}

            {/* MODAL MENU CHỌN SỬA/XÓA */}
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
                                    onClick={handleDelete} 
                                    disabled={isDeleting}
                                    className="bg-red-500 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isDeleting ? "Đang xóa..." : "Xóa chuyến này"}
                                </button>
                                <button className="bg-slate-100 py-4 rounded-2xl font-black active:scale-95 transition-all" onClick={() => setSelectedMenuIndex(null)}>Hủy bỏ</button>
                            </div>
                        )}
                    </div>
                </div>, document.body
            )}
        </div>
    );
}