import { Montserrat } from 'next/font/google'; // Gọi font Montserrat
import './globals.css';

// Thiết lập font
const montserrat = Montserrat({ 
  subsets: ['latin', 'vietnamese'], 
  weight: ['400', '700', '900'], // Các độ dày cần dùng
});

// ✅ ĐÃ SỬA: Bắt buộc phải có themeColor để phủ màu lên "tai thỏ" iPhone
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#bac4e5', // <--- BẠN ĐỪNG QUÊN DÒNG NÀY NHÉ
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      {/* Gán font vào toàn bộ trang web */}
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}