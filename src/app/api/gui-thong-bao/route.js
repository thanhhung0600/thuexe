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

// 2. HÀM LẤY NGÀY MAI (Chuẩn múi giờ Việt Nam)
const getTomorrowDateString = () => {
  // Ép lấy giờ Việt Nam hiện tại (Tránh việc Vercel dùng giờ Mỹ)
  const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
  now.setDate(now.getDate() + 1); // Cộng thêm 1 ngày
  
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`; 
};

// Hàm chuẩn hóa ngày trong Sheet (Xử lý dư dấu cách hoặc thiếu số 0)
const normalizeDate = (dateStr) => {
  if (!dateStr) return "";
  let cleanDate = String(dateStr).trim();
  const parts = cleanDate.split('/');
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${d}/${m}/${y}`;
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
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:G", 
    });

    const rows = response.data.values || [];
    const tomorrowStr = getTomorrowDateString(); // Ngày mai chuẩn: VD "26/04/2026"

    // 4. LỌC TÌM CÁC CHUYẾN ĐI (Có tính năng dọn dẹp lỗi gõ sai)
    const tomorrowTrips = rows.filter(row => {
      const tripDate = normalizeDate(row[0]); 
      return tripDate === tomorrowStr;
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

    // 6. GỬI LÊN FIREBASE
    const message = {
      notification: {
        title: `Lịch trình ngày mai (${tomorrowStr}) 🗓️`,
        body: notificationBody,
      },
      // ĐẢM BẢO CHỖ NÀY LÀ MÃ TOKEN CỦA BẠN (Đừng để mất dấu ngoặc kép nhé)
      token: "cwmFe0KjsJaUVZq770hTKp:APA91bHgc3Q2N8WvRyKDUkA3rsAkUxEvO9-FcPc23zZ9OMZfCERO1NpGltRy9aIgqN4AcDwTncGejw6Jb_iS4VDBMsYkBhJtkr9_J4f7Agamk8Wna7fpsNU", 
    };

    const fbResponse = await admin.messaging().send(message);

    return NextResponse.json({ 
      success: true, 
      message: "Đã gửi thông báo thành công về điện thoại!", 
      firebaseId: fbResponse 
    });

  } catch (error) {
    console.error("Lỗi API Gửi thông báo:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}