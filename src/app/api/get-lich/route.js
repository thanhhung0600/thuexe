import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // Đọc dữ liệu từ Sheet DATA (Lấy từ cột A đến J theo đúng cấu trúc của bạn)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:J", 
    });

    const rows = response.data.values || [];
    
    // Map dữ liệu xuất ra ĐÚNG CHUẨN tên biến của LichTrinhChiTiet.js
    const formattedData = rows.map(row => ({
      ngày: row[0] || "",        // Cột A (Index 0) - Dùng cho xemlich.js lọc ngày
      tenKhach: row[2] || "",    // Cột C (Index 2) - Khớp với item.tenKhach
      sdt: row[3] || "",         // Cột D (Index 3) - Khớp với item.sdt
      label: row[4] || "",       // Cột E (Index 4) - Khớp với item.label (Xe)
      taiXe: row[5] || "",       // Cột F (Index 5) - Khớp với item.taiXe
      time: row[6] || "",        // Cột G (Index 6) - Khớp với item.time (Giờ)
      gia: row[7] || "",         // Cột H (Index 7) - Khớp với item.gia
      ghiChu: row[8] || ""       // Cột I (Index 8) - Khớp với item.ghiChu
    }));

    return Response.json(formattedData);
  } catch (error) {
    console.error("Lỗi API GetLich:", error);
    return Response.json({ error: "Không thể lấy dữ liệu" }, { status: 500 });
  }
}