import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { id } = await req.json(); // Nhận rowId từ Client (ví dụ: 5)

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID dòng cần xóa" }, { status: 400 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    /**
     * LƯU Ý QUAN TRỌNG: 
     * startIndex là chỉ số bắt đầu từ 0. 
     * Nếu rowId trên Sheet là 5, thì startIndex trong API phải là 4.
     * endIndex là chỉ số dòng kết thúc (không bao gồm dòng này).
     */
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                // sheetId: 0 thường là tab đầu tiên. 
                // Nếu bạn đổi tên tab hoặc dùng tab khác, hãy kiểm tra 'gid' trên URL Google Sheet
                sheetId: 0, 
                dimension: "ROWS",
                startIndex: parseInt(id) - 1, 
                endIndex: parseInt(id),
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ success: true, message: `Đã xóa dòng ${id}` });
  } catch (error) {
    console.error("Lỗi API XoaLich:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server khi xóa" },
      { status: 500 }
    );
  }
}