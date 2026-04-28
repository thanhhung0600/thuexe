import { NextResponse } from 'next/server';
import { google } from "googleapis";

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ success: false, error: "Thiếu token" }, { status: 400 });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      // Quyền này cho phép ghi dữ liệu vào Sheet
      scopes: ["https://www.googleapis.com/auth/spreadsheets"], 
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Lấy danh sách token hiện có để check trùng lặp
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "TOKENS!A:A",
    });
    
    const existingTokens = getRes.data.values ? getRes.data.values.map(row => row[0]) : [];
    
    if (existingTokens.includes(token)) {
      return NextResponse.json({ success: true, message: "Token đã tồn tại, không cần lưu lại." });
    }

    // Nếu chưa có, tiến hành ghi thêm dòng mới vào file
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "TOKENS!A:A",
      valueInputOption: "RAW",
      requestBody: { values: [[token]] },
    });

    return NextResponse.json({ success: true, message: "Đã lưu Token thành công!" });

  } catch (error) {
    console.error("Lỗi lưu token:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}