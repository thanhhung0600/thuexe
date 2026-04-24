import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({ 
  subsets: ['latin', 'vietnamese'], 
  weight: ['400', '700', '900'],
});

// Cấu hình Viewport cho iOS (Giữ nguyên của bạn)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#bac4e5', 
};

// ✅ CẬP NHẬT METADATA: Khai báo PWA
export const metadata = {
  title: "Quản Lý Xe",
  description: "Hệ thống quản lý lịch trình nội bộ",
  manifest: "/manifest.json", // Kết nối với file manifest trong thư mục public
  appleWebApp: {
    capable: true,
    title: "Quản Lý Xe",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}