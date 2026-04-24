import { NextResponse } from 'next/server';
import { google } from "googleapis";
import admin from 'firebase-admin';

// 1. KHỞI TẠO FIREBASE ADMIN (Chỉ khởi tạo 1 lần)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Xử lý xuống dòng cho private_key từ file .env
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Hàm lấy ngày mai theo định dạng DD/MM/YYYY của bạn
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const yyyy = tomorrow.getFullYear();
  return `${dd}/${mm}/${yyyy}`; 
};

export async function GET(request) {
  try {
    // 2. KẾT NỐI VÀ ĐỌC GOOGLE SHEET
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
      range: "DATA!A2:G", // Lấy từ Cột A (Ngày) đến Cột G (Giờ)
    });

    const rows = response.data.values || [];
    const tomorrowStr = getTomorrowDateString();

    // 3. LỌC TÌM CÁC CHUYẾN ĐI CỦA NGÀY MAI
    const tomorrowTrips = rows.filter(row => {
      const tripDate = row[0] || ""; // Cột A chứa ngày
      return tripDate === tomorrowStr;
    });

    // Nếu không có lịch, dừng lại và báo thành công (nhưng không gửi tin nhắn)
    if (tomorrowTrips.length === 0) {
      return NextResponse.json({ success: true, message: `Ngày mai (${tomorrowStr}) không có lịch trình.` });
    }

    // 4. BIÊN SOẠN NỘI DUNG TIN NHẮN
    let notificationBody = `Bạn có ${tomorrowTrips.length} chuyến xe cần chuẩn bị:\n`;
    
    // Hiển thị chi tiết tối đa 3 chuyến đầu tiên để thông báo không bị quá dài
    tomorrowTrips.slice(0, 3).forEach((trip) => {
      const carName = trip[4] || "Chưa xếp xe";
      const time = trip[6] ? trip[6].replace(/^'/, '') : "Chưa rõ giờ";
      notificationBody += `• ${carName} - Lúc ${time}\n`;
    });

    // Nếu có hơn 3 chuyến, thêm dòng tóm tắt
    if (tomorrowTrips.length > 3) {
      notificationBody += `... và ${tomorrowTrips.length - 3} chuyến khác.`;
    }

    // 5. GỬI THÔNG BÁO VỀ ĐIỆN THOẠI
    const message = {
      notification: {
        title: `Lịch trình ngày mai (${tomorrowStr}) 🗓️`,
        body: notificationBody,
      },
      // ⚠️ ĐIỀN MÃ TOKEN CỦA BẠN VÀO ĐÂY:
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