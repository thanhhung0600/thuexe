"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ĐÃ BỔ SUNG hidePrice VÀO PROPS
export default function LichTrinhChiTiet({ data, showDate = false, onRefresh, isDarkMode, hidePrice }) {
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
    const [confirmingIndex, setConfirmingIndex] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    
    const [editForm, setEditForm] = useState({
        rowId: '', tenKhachHang: '', soDienThoai: '', loaiXe: '', taiXe: '', ngày: '', gio: '', gia: '', ghiChu: ''
    });

    const [isClient, setIsClient] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                setConfirmingIndex(null); 
                
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

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/sua-lich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            const result = await res.json();
            if (result.success) {
                setEditingIndex(null);
                if (typeof onRefresh === 'function') onRefresh();
            } else {
                alert("Lỗi lưu thông tin: " + result.error);
            }
        } catch (error) {
            console.error("Lỗi sửa:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = `w-full rounded-2xl px-4 py-3 text-[14px] font-bold outline-none transition-all ${
        isDarkMode 
            ? 'bg-slate-900/50 border border-slate-700 text-white focus:bg-slate-700 focus:border-blue-500 placeholder:text-slate-500' 
            : 'bg-slate-50 border border-slate-100 text-slate-700 focus:bg-white focus:border-blue-500'
    }`;

    if (!data || data.length === 0) return (
        <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <span className="text-3xl mb-2">🚗</span>
            <p className={`text-[12px] font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Lịch trình trống</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-2.5 p-1 relative">
            {data.map((item, index) => (
                <div key={item.rowId || index} className={`${defaultColors[index % 4]} rounded-xl p-3 relative shadow-md overflow-hidden min-h-[95px] flex flex-col justify-center`}>
                    <div className="w-full">
                        <div className="absolute top-3 right-3 bottom-3 flex flex-col items-end justify-between z-20">
                            <div className="flex items-center gap-2">
                                {/* TÍNH NĂNG 3: ẨN GIÁ TIỀN NẾU hidePrice BẰNG TRUE */}
                                {item.gia && !hidePrice && (
                                    <div className="bg-white/30 px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 animate-fade-in">
                                        {item.gia}
                                    </div>
                                )}
                                <div className="bg-black/10 backdrop-blur-md px-2 py-0.5 rounded border border-black/5 text-white text-[12px] font-bold">
                                    {showDate && <span className="text-[9px] block opacity-70">{formatDateShort(item.ngày || item.date)}</span>}
                                    {formatTime(item.time || item.gio)}
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedMenuIndex(index); }} 
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/40 active:scale-75 transition-all"
                            >
                                <svg className="w-4 h-4 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
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

            {/* BẢNG 1: TÙY CHỌN SỬA / XÓA CÓ HIỆU ỨNG */}
            {isClient && createPortal(
                <AnimatePresence>
                    {typeof selectedMenuIndex === 'number' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`fixed inset-0 z-[99999] flex items-center justify-center px-6 backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-900/40'}`} 
                            onClick={() => setSelectedMenuIndex(null)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`rounded-[32px] p-6 w-full max-w-[320px] shadow-2xl transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`} 
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className={`text-center font-black text-[18px] mb-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Tùy chọn chuyến xe</h3>
                                {checkIsLocked(data[selectedMenuIndex]) ? (
                                    <div className="text-center">
                                        <div className={`p-4 rounded-2xl border font-bold text-sm mb-4 ${isDarkMode ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>🔒 Chuyến đi cũ (Khóa)</div>
                                        <button className={`w-full py-4 rounded-2xl font-black ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'}`} onClick={() => setSelectedMenuIndex(null)}>Đóng</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => {
                                                const item = data[selectedMenuIndex];
                                                let safeDate = item.ngày || item.date || '';
                                                if (safeDate.includes('/')) {
                                                    const p = safeDate.split('/');
                                                    if(p.length === 3) safeDate = `${p[2]}-${String(p[1]).padStart(2, '0')}-${String(p[0]).padStart(2, '0')}`;
                                                } else if (safeDate.includes('-')) {
                                                    const p = safeDate.split('-');
                                                    if(p[0].length !== 4) safeDate = `${p[2]}-${String(p[1]).padStart(2, '0')}-${String(p[0]).padStart(2, '0')}`;
                                                }
                                                setEditForm({
                                                    rowId: item.rowId,
                                                    tenKhachHang: item.tenKhachHang || item.tenKhach || '',
                                                    soDienThoai: item.soDienThoai || item.sdt || '',
                                                    loaiXe: item.loaiXe || item.label || '',
                                                    taiXe: item.taiXe || '',
                                                    ngày: safeDate,
                                                    gio: formatTime(item.gio || item.time || ''),
                                                    gia: item.gia || '',
                                                    ghiChu: item.ghiChu || ''
                                                });
                                                setEditingIndex(selectedMenuIndex);
                                                setSelectedMenuIndex(null); 
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all"
                                        >
                                            Sửa thông tin
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const id = data[selectedMenuIndex].rowId;
                                                setSelectedMenuIndex(null); 
                                                setConfirmingIndex(id); 
                                            }} 
                                            className="bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all"
                                        >
                                            Xóa chuyến này
                                        </button>
                                        <button className={`py-4 rounded-2xl font-black active:scale-95 transition-all ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => setSelectedMenuIndex(null)}>Hủy bỏ</button>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>, document.body
            )}

            {/* BẢNG 2: XÁC NHẬN XÓA CÓ HIỆU ỨNG */}
            {isClient && createPortal(
                <AnimatePresence>
                    {typeof confirmingIndex === 'number' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`fixed inset-0 z-[100000] flex items-center justify-center px-6 backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-900/60'}`} 
                            onClick={() => setConfirmingIndex(null)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`rounded-[32px] p-7 w-full max-w-[340px] shadow-2xl relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`} 
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-60 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`} />
                                <div className="relative z-10">
                                    <div className="flex justify-center mb-5 text-[#FE3039]">
                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </div>
                                    <h3 className={`text-center font-black text-[20px] mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Xác nhận xóa?</h3>
                                    <p className={`text-center text-[14px] mb-7 leading-relaxed px-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Bạn có chắc chắn muốn xóa chuyến của <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{data.find(d => d.rowId === confirmingIndex)?.tenKhachHang || data.find(d => d.rowId === confirmingIndex)?.tenKhach}</span> không? Hành động này không thể hoàn tác.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={() => handleDelete(confirmingIndex)}
                                            disabled={isDeleting}
                                            className="w-full bg-[#FE3039] hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Đúng, xóa vĩnh viễn"
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => setConfirmingIndex(null)}
                                            disabled={isDeleting}
                                            className={`w-full font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-60 ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-[#475569]'}`}
                                        >
                                            Hủy bỏ
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>, document.body
            )}

            {/* BẢNG 3: SỬA THÔNG TIN */}
            {isClient && createPortal(
                <AnimatePresence>
                    {typeof editingIndex === 'number' && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`fixed inset-0 z-[100000] flex items-center justify-center px-4 py-6 backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-900/60'}`} 
                            onClick={() => setEditingIndex(null)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`rounded-[32px] p-6 w-full max-w-[360px] shadow-2xl relative overflow-hidden flex flex-col max-h-full transition-colors ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`} 
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-5 shrink-0">
                                    <h3 className={`font-black text-[18px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Sửa thông tin</h3>
                                    <button onClick={() => setEditingIndex(null)} className={`p-2 rounded-full active:scale-90 transition-all ${isDarkMode ? 'bg-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="overflow-y-auto no-scrollbar pb-2 space-y-3 flex-1 px-1">
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Khách hàng</label>
                                        <input type="text" name="tenKhachHang" value={editForm.tenKhachHang} onChange={handleEditChange} placeholder="Tên khách hàng" className={inputClass} />
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Số điện thoại</label>
                                        <input type="text" name="soDienThoai" value={editForm.soDienThoai} onChange={handleEditChange} placeholder="09xxxx..." className={inputClass} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Loại xe</label>
                                            <select 
                                                name="loaiXe" 
                                                value={editForm.loaiXe} 
                                                onChange={handleEditChange} 
                                                className={`${inputClass} appearance-none cursor-pointer`}
                                            >
                                                <option value="" className="text-slate-400">Chọn xe *</option>
                                                <option value="Xe 4 (Thái)">Xe 4 chỗ (Thái)</option>
                                                <option value="Xe 4 (Học)">Xe 4 chỗ (Học)</option>
                                                <option value="Xe 7 (Mitsubishi)">Xe 7 chỗ (Mitsubishi)</option>
                                                <option value="Xe 8 (Toyota)">Xe 7 chỗ (Toyota)</option>
                                                <option value="Xe Khác">Xe Khác</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Tài xế</label>
                                            <input type="text" name="taiXe" value={editForm.taiXe} onChange={handleEditChange} placeholder="Tên tài xế" className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Ngày chạy</label>
                                            <input type="date" name="ngày" value={editForm.ngày} onChange={handleEditChange} className={`${inputClass} uppercase`} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Giờ chạy</label>
                                            <input type="time" name="gio" value={editForm.gio} onChange={handleEditChange} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Giá tiền</label>
                                        <input type="text" name="gia" value={editForm.gia} onChange={handleEditChange} placeholder="VND" className={inputClass} />
                                    </div>

                                    <div className="space-y-1 pb-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Ghi chú</label>
                                        <textarea name="ghiChu" value={editForm.ghiChu} onChange={handleEditChange} placeholder="Ghi chú thêm..." rows="2" className={`${inputClass} resize-none`}></textarea>
                                    </div>

                                </div>

                                <div className={`pt-4 mt-2 border-t shrink-0 transition-colors ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                    <button 
                                        onClick={handleSaveEdit} 
                                        disabled={isSaving} 
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>, document.body
            )}
            
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}