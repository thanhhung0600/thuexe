import { Montserrat } from 'next/font/google'; // Gọi font Montserrat
import './globals.css';

// Thiết lập font
const montserrat = Montserrat({ 
  subsets: ['latin', 'vietnamese'], 
  weight: ['400', '700', '900'], // Các độ dày cần dùng
});

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      {/* Gán font vào toàn bộ trang web */}
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}