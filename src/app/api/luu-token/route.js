import { NextResponse } from 'next/server';
import { google } from "googleapis";

export async function POST(request) {
  try {
    // Nhận thêm 3 biến sang, trua, toi từ Frontend
    const { token, sang = false, trua = false, toi = false } = await request.json();
    if (!token) return NextResponse.json({ success: false, error: "Thiếu token" }, { status: 400 });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], 
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Lấy toàn bộ dữ liệu tab TOKENS
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "TOKENS!A:D",
    });
    
    const rows = getRes.data.values || [];
    // Tìm xem token này nằm ở dòng thứ mấy (Google Sheet bắt đầu từ dòng 1)
    const rowIndex = rows.findIndex(row => row[0] === token);
    
    // Dữ liệu dòng mới: [Mã Token, BậtSáng, BậtTrưa, BậtTối]
    const rowData = [token, String(sang), String(trua), String(toi)];

    if (rowIndex !== -1) {
      // Nếu đã có Token -> Cập nhật (Update) lại đúng dòng đó
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `TOKENS!A${rowIndex + 1}:D${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
      return NextResponse.json({ success: true, message: "Đã cập nhật cài đặt giờ nhận thông báo!" });
    } else {
      // Nếu chưa có -> Thêm mới (Append) vào cuối danh sách
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "TOKENS!A:D",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [rowData] },
      });
      return NextResponse.json({ success: true, message: "Đã lưu Token và cài đặt mới!" });
    }

  } catch (error) {
    console.error("Lỗi lưu token:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}