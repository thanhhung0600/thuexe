"use client";
import ThongKe from "../components/thongke";
import TimKiem from "../components/timkiem";
import { useState, useEffect } from "react";
import DatLich from "../components/datlich";
import XemLich from "../components/xemlich";
import ToastContainer from "../components/ToastContainer";
import NavigationTabs from "../components/NavigationTabs";

// Import hàm xin quyền thông báo từ file firebase.js
import { requestForToken } from "../lib/firebase";

export default function Home() {
  const [activeTab, setActiveTab] = useState("xem-lich");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [defaultView, setDefaultView] = useState("day");

  const [notis, setNotis] = useState([
    { id: 1, label: "Sáng (07:00)", enabled: false },
    { id: 2, label: "Trưa (11:00)", enabled: false },
    { id: 3, label: "Tối (19:00)", enabled: false },
  ]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hidePastTrips, setHidePastTrips] = useState(false);
  const [preTripReminder, setPreTripReminder] = useState("none");
  const [hidePrice, setHidePrice] = useState(false); // TÍNH NĂNG 3: ẨN GIÁ TIỀN

  // --- HÀM ĐỒNG BỘ TOKEN VÀ CÀI ĐẶT GIỜ LÊN SERVER ---
  const syncTokenWithPrefs = async (currentToken, currentNotis) => {
    if (!currentToken) return;
    const sang = currentNotis.find(n => n.id === 1).enabled;
    const trua = currentNotis.find(n => n.id === 2).enabled;
    const toi = currentNotis.find(n => n.id === 3).enabled;

    try {
      await fetch('/api/luu-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: currentToken, sang, trua, toi })
      });
    } catch (e) {
      console.error("Lỗi đồng bộ cấu hình thông báo:", e);
    }
  };

  useEffect(() => {
    const savedView = localStorage.getItem("defaultViewMode") || "day";
    setDefaultView(savedView);

    const savedNotis = localStorage.getItem("notiSettings");
    if (savedNotis) setNotis(JSON.parse(savedNotis));

    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
    
    const savedHidePast = localStorage.getItem("hidePastTrips") === "true";
    setHidePastTrips(savedHidePast);

    const savedHidePrice = localStorage.getItem("hidePrice") === "true";
    setHidePrice(savedHidePrice);
    
    const savedPreTrip = localStorage.getItem("preTripReminder") || "none";
    setPreTripReminder(savedPreTrip);
  }, []);

  // Tự động lấy token và đồng bộ ngầm khi mở app
  useEffect(() => {
    const autoFetchToken = async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            const token = await requestForToken();
            const savedNotis = JSON.parse(localStorage.getItem("notiSettings")) || notis;
            await syncTokenWithPrefs(token, savedNotis);
          } catch (error) {
            console.error("Lỗi tự động cập nhật token:", error);
          }
        }
      }
    };
    autoFetchToken();
  }, []);

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleSaveDefaultView = (mode) => {
    localStorage.setItem("defaultViewMode", mode);
    setDefaultView(mode);
    addToast(`Đã lưu mặc định: Xem theo ${mode === 'day' ? 'Ngày' : 'Tuần'}`, "success");
  };

  const toggleNoti = async (id) => {
    const newNotis = notis.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n);
    setNotis(newNotis);
    localStorage.setItem("notiSettings", JSON.stringify(newNotis));
    
    const toggledNoti = newNotis.find(n => n.id === id);
    const sessionName = toggledNoti.label.split(" ")[0]; 
    addToast(`Đã ${toggledNoti.enabled ? 'bật' : 'tắt'} thông báo buổi ${sessionName}`, "success");

    // Nếu đã có quyền, đồng bộ ngay lập tức cấu hình mới lên Google Sheets
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      const token = await requestForToken();
      await syncTokenWithPrefs(token, newNotis);
    }
  };

  const toggleDarkMode = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("darkMode", newVal);
    addToast(`Đã ${newVal ? 'bật' : 'tắt'} Giao diện tối`, "success");
  };

  const toggleHidePastTrips = () => {
    const newVal = !hidePastTrips;
    setHidePastTrips(newVal);
    localStorage.setItem("hidePastTrips", newVal);
    addToast(`Đã ${newVal ? 'ẩn' : 'hiện'} các chuyến đi cũ`, "success");
  };

  const toggleHidePrice = () => {
    const newVal = !hidePrice;
    setHidePrice(newVal);
    localStorage.setItem("hidePrice", newVal);
    addToast(`Đã ${newVal ? 'ẩn' : 'hiện'} giá tiền`, "success");
  };

  const handleSavePreTrip = (val) => {
    setPreTripReminder(val);
    localStorage.setItem("preTripReminder", val);
    const labels = { "none": "Tắt", "15m": "15 phút", "30m": "30 phút", "1h": "1 tiếng" };
    addToast(`Nhắc trước giờ chạy: ${labels[val]}`, "success");
  };

  const [formData, setFormData] = useState({
    tenKhach: "", sdt: "", loaiXe: "", taiXe: "", ngayThue: "", gioThue: "", gia: "", ghiChu: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const requiredFields = ["tenKhach", "loaiXe", "ngayThue"];
    let newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === "") newErrors[field] = true;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsSubmitting(true);
    addToast("Đang lưu thông tin...", "success");

    try {
      const dateObj = new Date(formData.ngayThue);
      const thu = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateObj.getDay()];

      const payload = {
        ngay: formData.ngayThue, thu,
        tenKhachHang: formData.tenKhach, soDienThoai: formData.sdt,
        loaiXe: formData.loaiXe, taiXe: formData.taiXe,
        gio: formData.gioThue, gia: formData.gia, ghiChu: formData.ghiChu
      };

      const response = await fetch('/api/dat-lich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        addToast("Lưu thành công!", "success");
        setFormData({ tenKhach: "", sdt: "", loaiXe: "", taiXe: "", ngayThue: "", gioThue: "", gia: "", ghiChu: "" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addToast("Lỗi: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnableNotification = async () => {
    try {
      addToast("Đang kết nối để xin quyền...", "success"); 
      const token = await requestForToken();
      if (token) {
        await syncTokenWithPrefs(token, notis);
        addToast("Đã bật thông báo thành công!", "success");
      } else {
        addToast("Từ chối nhận thông báo hoặc không hỗ trợ.", "error");
      }
    } catch (error) {
      addToast(`Lỗi: ${error.message}`, "error"); 
    }
  };

  return (
    <main className={`min-h-[100dvh] w-full flex items-center justify-center p-4 font-sans relative overflow-hidden flex-col transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-[#bac4e5]'}`}>
      <ToastContainer toasts={toasts} />

      <div className="w-full max-w-md relative">
        <div className="relative z-10 -mb-[1px]">
          <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />
        </div>

        <div className={`shadow-2xl p-6 sm:p-8 border rounded-[1.5rem] relative z-0 transition-all duration-500 overflow-hidden pb-12 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
          {activeTab === "dat-lich" && (
            <DatLich isDarkMode={isDarkMode} formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} errors={errors} isSubmitting={isSubmitting} />
          )}
          {activeTab === "xem-lich" && (
            <XemLich hidePastTrips={hidePastTrips} isDarkMode={isDarkMode} hidePrice={hidePrice} />
          )}
          {activeTab === "thong-ke" && <ThongKe isDarkMode={isDarkMode} />}
          {activeTab === "tim-kiem" && <TimKiem isDarkMode={isDarkMode}/>}
        </div>
      </div>

      <button
        onClick={() => setIsSettingsOpen(true)}
        className={`fixed bottom-4 right-4 z-40 p-2.5 backdrop-blur-md border shadow-sm rounded-full active:scale-95 transition-all duration-300 ${isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-400' : 'bg-white/40 border-white/50 text-slate-600 opacity-50 hover:opacity-100'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSettingsOpen(false)}
      ></div>

      <div 
        className={`fixed bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-3xl shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'} ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer shrink-0" onClick={() => setIsSettingsOpen(false)}>
          <div className={`w-12 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
        </div>

        <div className="p-6 pt-2 overflow-y-auto no-scrollbar flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Cài đặt</h2>
            <button onClick={() => setIsSettingsOpen(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Thông báo nhắc lịch</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {notis.map((noti) => {
                  const timeParts = noti.label.split(" ");
                  return (
                    <div 
                      key={noti.id} 
                      onClick={() => toggleNoti(noti.id)}
                      className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-[1rem] border transition-all cursor-pointer shadow-sm active:scale-95 ${
                        noti.enabled 
                          ? (isDarkMode ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50/80 border-blue-200') 
                          : (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60')
                      }`}
                    >
                      <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors mb-2.5 pointer-events-none ${noti.enabled ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${noti.enabled ? 'translate-x-4.5 ml-[2px]' : 'translate-x-1'}`} />
                      </button>
                      <span className={`font-black text-[12px] tracking-wide ${noti.enabled ? (isDarkMode ? 'text-blue-400' : 'text-blue-700') : 'text-slate-400'}`}>{timeParts[0]}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${noti.enabled ? (isDarkMode ? 'text-blue-300' : 'text-blue-500') : 'text-slate-500'}`}>{timeParts[1]}</span>
                    </div>
                  );
                })}
              </div>

              <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200/60'}`}>
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest block mb-3 pl-1">Nhắc sát giờ chạy</span>
                <div className={`flex p-1 rounded-xl border gap-1 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'}`}>
                  {["none", "15m", "30m", "1h"].map(val => (
                    <button
                      key={val}
                      onClick={() => handleSavePreTrip(val)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${preTripReminder === val ? 'bg-blue-500 text-white shadow-md' : (isDarkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50')}`}
                    >
                      {val === "none" ? "Tắt" : val === "15m" ? "15P" : val === "30m" ? "30P" : "1H"}
                    </button>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => { handleEnableNotification(); setIsSettingsOpen(false); }}
                className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-md active:scale-95 transition-all border border-slate-700"
              >
                Kích hoạt hệ thống thông báo
              </button>
            </div>

            <div className={`p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </div>
                <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Hiển thị & Giao diện</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className={`flex items-center justify-between p-3 px-4 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'}`}>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Ẩn chuyến đi cũ</span>
                  <button onClick={toggleHidePastTrips} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hidePastTrips ? 'bg-purple-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hidePastTrips ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* TÍNH NĂNG 3: ẨN GIÁ TIỀN */}
                <div className={`flex items-center justify-between p-3 px-4 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'}`}>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Ẩn giá tiền (Bảo mật)</span>
                  <button onClick={toggleHidePrice} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hidePrice ? 'bg-orange-500' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hidePrice ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className={`flex items-center justify-between p-3 px-4 rounded-xl border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'}`}>
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Giao diện tối</span>
                  <button onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200/60'}`}>
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-widest block mb-2 pl-1">Chế độ xem mặc định</span>
                <div className={`flex p-1 rounded-xl border gap-1 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'}`}>
                  <button onClick={() => handleSaveDefaultView("day")} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${defaultView === 'day' ? 'bg-purple-600 text-white shadow-md' : (isDarkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50')}`}>Theo Ngày</button>
                  <button onClick={() => handleSaveDefaultView("week")} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${defaultView === 'week' ? 'bg-purple-600 text-white shadow-md' : (isDarkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50')}`}>Theo Tuần</button>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center pb-4 text-[10px] text-slate-500 uppercase tracking-widest">Phiên bản 2.0.3</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}