export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { google } from "googleapis";
import admin from 'firebase-admin';

// 1. KHỞI TẠO FIREBASE ADMIN
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// 2. HÀM LẤY NGÀY MAI (Ép chuẩn múi giờ Việt Nam)
const getTomorrowDateString = () => {
  const now = new Date(); 
  // Ép tuyệt đối về múi giờ Việt Nam (UTC+7)
  const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  vnTime.setDate(vnTime.getDate() + 1); 
  
  const dd = String(vnTime.getDate()).padStart(2, '0');
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
  const yyyy = vnTime.getFullYear();
  return `${dd}/${mm}/${yyyy}`; 
};

// Hàm chuẩn hóa ngày (Dịch được cả 2026-04-26 và 26/4/2026)
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  let cleanDate = String(dateStr).trim();

  if (cleanDate.includes('-')) {
    const parts = cleanDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${d}/${m}/${y}`;
    }
  }
  return cleanDate;
};

export async function GET(request) {
  try {
    // 3. KẾT NỐI GOOGLE SHEET
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      // Chú ý: Cần quyền này để có thể đọc/ghi các sheet
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // --- LẤY DỮ LIỆU LỊCH TRÌNH ---
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:G", 
    });

    const rows = response.data.values || [];
    const tomorrowStr = getTomorrowDateString(); 

    // 4. LỌC TÌM CÁC CHUYẾN ĐI NGÀY MAI
    const tomorrowTrips = rows.filter(row => {
      return normalizeDate(row[0]) === tomorrowStr;
    });

    if (tomorrowTrips.length === 0) {
      return NextResponse.json({ success: true, message: `Ngày mai (${tomorrowStr}) không có lịch trình.` });
    }

    // 5. TẠO NỘI DUNG THÔNG BÁO
    let notificationBody = `Bạn có ${tomorrowTrips.length} chuyến xe cần chuẩn bị:\n`;
    
    tomorrowTrips.slice(0, 3).forEach((trip) => {
      const carName = trip[4] || "Chưa xếp xe";
      const time = trip[6] ? trip[6].replace(/^'/, '') : "Chưa rõ giờ";
      notificationBody += `• ${carName} - Lúc ${time}\n`;
    });

    if (tomorrowTrips.length > 3) {
      notificationBody += `... và ${tomorrowTrips.length - 3} chuyến khác.`;
    }

    // --- ĐOẠN ĐÃ SỬA: ĐỌC DANH SÁCH TOKEN VÀ GỬI MULTICAST ---
    const tokenResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "TOKENS!A:A", 
    });

    const tokenRows = tokenResponse.data.values || [];
    const tokens = tokenRows.map(row => row[0]).filter(token => token && token.trim() !== "");

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, error: "Không có thiết bị nào đăng ký nhận thông báo." });
    }

    const message = {
      notification: {
        title: `Lịch trình ngày mai (${tomorrowStr}) 🗓️`,
        body: notificationBody,
      },
      tokens: tokens, // Gửi cho toàn bộ mảng token này
    };

    const fbResponse = await admin.messaging().sendEachForMulticast(message);

    return NextResponse.json({ 
      success: true, 
      message: `Đã gửi thông báo thành công cho ${fbResponse.successCount} thiết bị!`, 
      details: fbResponse 
    });

  } catch (error) {
    console.error("Lỗi API Gửi thông báo:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}