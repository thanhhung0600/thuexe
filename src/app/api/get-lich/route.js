import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      // Chuyển sang dùng scope đầy đủ để linh hoạt hơn (hoặc giữ readonly nếu chỉ đọc)
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // 1. Đọc dữ liệu từ Sheet DATA
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "DATA!A2:J", 
    });

    const rows = response.data.values || [];
    
    /**
     * 2. Map dữ liệu và gán rowId
     * Quan trọng: Chúng ta dùng index của mảng gốc để rowId luôn khớp với dòng trên Sheet
     * index 0 tương ứng dòng 2 trên Google Sheet
     */
    const formattedData = rows
      .map((row, index) => {
        // Nếu dòng hoàn toàn trống thì bỏ qua (kiểm tra cột ngày và tên khách)
        if (!row[0] && !row[2]) return null;

        return {
          rowId: index + 2, // Địa chỉ dòng thực tế trên Sheet để Xóa/Sửa
          ngày: row[0] || "",        
          tenKhach: row[2] || "",    
          sdt: row[3] || "",         
          label: row[4] || "",       
          taiXe: row[5] || "",       
          time: row[6] || "",        
          gia: row[7] || "",         
          ghiChu: row[8] || ""       
        };
      })
      .filter(item => item !== null); // Loại bỏ các dòng trống đã lọc ở trên

    // 3. Trả về Response kèm Header chống Cache triệt để
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      },
    });

  } catch (error) {
    console.error("Lỗi API GetLich:", error);
    return new Response(JSON.stringify({ error: "Không thể lấy dữ liệu" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}