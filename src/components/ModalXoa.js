"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalXoa({ isOpen, onClose, onConfirm, itemName, isLoading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Lớp nền mờ - Z-index cực cao */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000001]"
          />

          {/* Nội dung Modal - Z-index cao hơn nền */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white rounded-t-[2.5rem] z-[1000002] p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" onClick={onClose} />

            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-[18px] font-black text-slate-800 mb-2">Xác nhận xóa?</h3>
              <p className="text-[13px] text-slate-500 mb-8 px-4 leading-relaxed">
                Bạn muốn xóa chuyến của <span className="font-bold text-red-500">"{itemName}"</span>? <br/>Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-[11px] tracking-widest rounded-2xl active:scale-95 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Xóa ngay"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}