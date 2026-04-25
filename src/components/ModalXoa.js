"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ModalXoa({ isOpen, onClose, onConfirm, itemName, isLoading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center px-6 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-[32px] p-7 w-full max-w-[340px] shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Vòng tròn trang trí nền */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-50 rounded-full opacity-60" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-5 text-red-500">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-center font-black text-slate-800 text-[20px] mb-2">Xác nhận xóa chuyến xe?</h3>
              <p className="text-center text-slate-600 text-sm mb-7 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn chuyến xe của khách hàng 
                <span className="font-bold text-slate-800"> {itemName || "này"}</span>? Hành động này không thể hoàn tác.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đúng, xóa vĩnh viễn"
                  )}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-60"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}